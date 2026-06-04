import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { createDb, word_sets, leaderboard, asc, eq } from '@wordsort/db';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const db = createDb(process.env.DATABASE_URL);
const app = new Hono().basePath('/api');

// GET /api/words — return the current active word set
app.get('/words', async (c) => {
  const [wordSet] = await db
    .select()
    .from(word_sets)
    .where(eq(word_sets.is_active, true))
    .limit(1);

  if (!wordSet) {
    return c.json({ error: 'No active word set found' }, 404);
  }

  return c.json({
    id: wordSet.id,
    date: wordSet.puzzle_date,
    words: wordSet.words,
  });
});

// POST /api/scores — submit a leaderboard score
app.post('/scores', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { name, steps, timeSeconds } = body as Record<string, unknown>;

  if (typeof name !== 'string' || !name.trim()) {
    return c.json({ error: 'name is required' }, 400);
  }
  if (typeof steps !== 'number' || steps < 1) {
    return c.json({ error: 'steps must be a positive number' }, 400);
  }
  if (typeof timeSeconds !== 'number' || timeSeconds < 1) {
    return c.json({ error: 'timeSeconds must be a positive number' }, 400);
  }

  const [entry] = await db
    .insert(leaderboard)
    .values({
      player_name: name.trim(),
      steps,
      time_seconds: timeSeconds,
    })
    .returning();

  return c.json(
    {
      id: entry.id,
      name: entry.player_name,
      steps: entry.steps,
      timeSeconds: entry.time_seconds,
      submittedAt: entry.submitted_at,
    },
    201,
  );
});

// GET /api/leaderboard — top scores sorted by steps asc, then time asc
app.get('/leaderboard', async (c) => {
  const limitParam = c.req.query('limit');
  const limit = Math.min(Math.max(parseInt(limitParam ?? '10', 10) || 10, 1), 100);

  const entries = await db
    .select()
    .from(leaderboard)
    .orderBy(asc(leaderboard.steps), asc(leaderboard.time_seconds))
    .limit(limit);

  return c.json(
    entries.map((e) => ({
      id: e.id,
      name: e.player_name,
      steps: e.steps,
      timeSeconds: e.time_seconds,
      submittedAt: e.submitted_at,
    })),
  );
});

const port = parseInt(process.env.PORT ?? '3001', 10);
serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://localhost:${port}`);
});
