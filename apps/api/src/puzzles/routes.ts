import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createDb, word_sets, eq, cacheGet, cacheSetWithTTL } from '@wordsort/db';

function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
}

export const puzzlesRouter = new Hono();

const db = createDb(process.env.DATABASE_URL!);

// GET /api/puzzles/daily — returns today's puzzle; Redis-cached until midnight UTC
puzzlesRouter.get('/daily', async (c) => {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `puzzle:daily:${today}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  const [wordSet] = await db
    .select()
    .from(word_sets)
    .where(eq(word_sets.puzzle_date, today))
    .limit(1);

  if (!wordSet) {
    throw new HTTPException(404, { message: 'No puzzle scheduled for today' });
  }

  const result = {
    id: wordSet.id,
    date: wordSet.puzzle_date,
    words: wordSet.words,
  };

  await cacheSetWithTTL(cacheKey, result, secondsUntilMidnightUTC());
  return c.json(result);
});
