import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createDb, puzzles, categories, eq, asc, cacheGet, cacheSetWithTTL } from '@wordsort/db';

function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
}

export const puzzlesRouter = new Hono();

const db = createDb(process.env.DATABASE_URL!);

// GET /api/puzzles/daily — returns today's puzzle with categories; Redis-cached until midnight UTC
puzzlesRouter.get('/daily', async (c) => {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `puzzle:daily:${today}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  const [puzzle] = await db
    .select()
    .from(puzzles)
    .where(eq(puzzles.date, today))
    .limit(1);

  if (!puzzle) {
    throw new HTTPException(404, { message: 'No puzzle scheduled for today' });
  }

  const puzzleCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.puzzle_id, puzzle.id))
    .orderBy(asc(categories.sort_order));

  if (puzzleCategories.length === 0) {
    throw new HTTPException(404, { message: 'Puzzle has no categories' });
  }

  const result = {
    id: puzzle.id,
    date: puzzle.date,
    title: puzzle.title,
    difficulty: puzzle.difficulty,
    categories: puzzleCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      words: cat.words,
    })),
  };

  await cacheSetWithTTL(cacheKey, result, secondsUntilMidnightUTC());
  return c.json(result);
});
