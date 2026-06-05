import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { createDb, puzzles, categories, scores, eq, and, isNotNull } from '@wordsort/db';
import { getRedis, dailyPuzzleTtl } from '../redis';

const MISTAKE_PENALTY_MS = 10_000;

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

type PuzzleWithCategories = {
  id: string;
  date: string;
  title: string;
  difficulty: string;
  categories: Array<{ id: string; name: string; words: string[] }>;
};

function shapePuzzle(
  puzzle: typeof puzzles.$inferSelect,
  cats: (typeof categories.$inferSelect)[],
): PuzzleWithCategories {
  return {
    id: puzzle.id,
    date: puzzle.date,
    title: puzzle.title,
    difficulty: puzzle.difficulty,
    categories: cats.map((c) => ({ id: c.id, name: c.name, words: c.words })),
  };
}

async function getPuzzleById(id: string): Promise<PuzzleWithCategories | null> {
  const db = getDb();
  const [puzzle] = await db.select().from(puzzles).where(eq(puzzles.id, id)).limit(1);
  if (!puzzle) return null;
  const cats = await db.select().from(categories).where(eq(categories.puzzle_id, puzzle.id));
  return shapePuzzle(puzzle, cats);
}

async function getPuzzleByDate(date: string): Promise<PuzzleWithCategories | null> {
  const db = getDb();
  const [puzzle] = await db
    .select()
    .from(puzzles)
    .where(and(eq(puzzles.date, date), isNotNull(puzzles.published_at)))
    .limit(1);
  if (!puzzle) return null;
  const cats = await db.select().from(categories).where(eq(categories.puzzle_id, puzzle.id));
  return shapePuzzle(puzzle, cats);
}

const idParamSchema = z.string().uuid('Invalid puzzle ID');

const submitSchema = z.object({
  time_ms: z.number().int().positive(),
  mistakes: z.number().int().min(0),
  solution: z
    .array(
      z.object({
        category_id: z.string().uuid(),
        words: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
});

export const puzzleRouter = new Hono();

// GET /puzzles/daily — today's puzzle, Redis-cached until midnight UTC
puzzleRouter.get('/daily', async (c) => {
  const todayDate = new Date().toISOString().slice(0, 10);
  const cacheKey = `puzzle:daily:${todayDate}`;

  const redis = getRedis();
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return c.json(JSON.parse(cached) as PuzzleWithCategories);
    } catch {
      // Redis unavailable — fall through to DB
    }
  }

  const puzzle = await getPuzzleByDate(todayDate);
  if (!puzzle) throw new HTTPException(404, { message: 'No puzzle available for today' });

  if (redis) {
    try {
      await redis.setex(cacheKey, dailyPuzzleTtl(), JSON.stringify(puzzle));
    } catch {
      // Cache write failed — non-fatal
    }
  }

  return c.json(puzzle);
});

// GET /puzzles/:id — fetch puzzle by ID
puzzleRouter.get('/:id', async (c) => {
  const rawId = c.req.param('id');
  const parsed = idParamSchema.safeParse(rawId);
  if (!parsed.success) throw new HTTPException(400, { message: 'Invalid puzzle ID' });

  const puzzle = await getPuzzleById(parsed.data);
  if (!puzzle) throw new HTTPException(404, { message: 'Puzzle not found' });
  return c.json(puzzle);
});

// POST /puzzles/:id/submit — validate solution; record score if authenticated
puzzleRouter.post('/:id/submit', async (c) => {
  const rawId = c.req.param('id');
  const parsed = idParamSchema.safeParse(rawId);
  if (!parsed.success) throw new HTTPException(400, { message: 'Invalid puzzle ID' });

  const puzzle = await getPuzzleById(parsed.data);
  if (!puzzle) throw new HTTPException(404, { message: 'Puzzle not found' });

  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body' });
  }

  const { time_ms, mistakes, solution } = submitSchema.parse(raw);

  if (solution.length !== puzzle.categories.length) {
    return c.json({ solved: false, error: 'Solution must cover all categories' }, 400);
  }

  const categoryMap = new Map(puzzle.categories.map((cat) => [cat.id, cat.words]));

  for (const item of solution) {
    const expected = categoryMap.get(item.category_id);
    if (!expected) {
      return c.json({ solved: false, error: `Unknown category: ${item.category_id}` }, 400);
    }
    const normalize = (ws: string[]) => ws.map((w) => w.toUpperCase()).sort();
    if (JSON.stringify(normalize(expected)) !== JSON.stringify(normalize(item.words))) {
      return c.json({ solved: false });
    }
  }

  // score = total time + penalty per mistake
  const score = time_ms + mistakes * MISTAKE_PENALTY_MS;

  const user = c.get('user');
  if (user) {
    const db = getDb();
    const [entry] = await db
      .insert(scores)
      .values({ user_id: user.sub, puzzle_id: parsed.data, time_ms, mistakes })
      .returning({ id: scores.id });
    return c.json({ solved: true, score, entry_id: entry.id });
  }

  return c.json({ solved: true, score });
});
