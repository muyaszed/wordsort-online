import 'dotenv/config';
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });
}

import type { Server as HTTPServer } from 'node:http';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import pino from 'pino';
import { z } from 'zod';
import { createDb, word_sets, leaderboard, asc, eq, sql } from '@wordsort/db';
import { attachSocketIO } from './ws';
import { authRouter } from './auth/routes';
import { usersRouter, recalculateStreak } from './users/routes';
import { attachUser, requireAuth } from './auth/middleware';
import { cacheGet, cacheSet, cacheInvalidateLeaderboard } from './redis';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

export const logger = pino(
  process.env.NODE_ENV !== 'production'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {},
);

const db = createDb(process.env.DATABASE_URL);
const app = new Hono().basePath('/api');

app.use(
  '*',
  cors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  logger.info({ method: c.req.method, path: c.req.path, status: c.res.status, ms: Date.now() - start });
});

app.use('*', attachUser);
app.route('/auth', authRouter);
app.route('/users', usersRouter);

app.get('/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  if (err instanceof z.ZodError) {
    return c.json({ error: 'Validation failed', issues: err.issues }, 400);
  }
  logger.error({ err }, 'Unhandled error');
  Sentry.captureException(err);
  return c.json({ error: 'Internal server error' }, 500);
});

const scoreBodySchema = z.object({
  name: z.string().min(1, 'name is required'),
  steps: z.number().int().min(1, 'steps must be a positive integer'),
  timeSeconds: z.number().int().min(1, 'timeSeconds must be a positive integer'),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// GET /api/words — return the current active word set
app.get('/words', async (c) => {
  const [wordSet] = await db
    .select()
    .from(word_sets)
    .where(eq(word_sets.is_active, true))
    .limit(1);

  if (!wordSet) {
    throw new HTTPException(404, { message: 'No active word set found' });
  }

  return c.json({
    id: wordSet.id,
    date: wordSet.puzzle_date,
    words: wordSet.words,
  });
});

// POST /api/scores — auth required; save score and invalidate leaderboard cache
app.post('/scores', requireAuth, async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body' });
  }

  const { name, steps, timeSeconds } = scoreBodySchema.parse(raw);

  const [wordSet] = await db
    .select({ puzzle_date: word_sets.puzzle_date })
    .from(word_sets)
    .where(eq(word_sets.is_active, true))
    .limit(1);

  if (!wordSet) {
    throw new HTTPException(422, { message: 'No active puzzle found' });
  }

  const user = c.get('user');

  const [entry] = await db
    .insert(leaderboard)
    .values({
      player_name: name.trim(),
      steps,
      time_seconds: timeSeconds,
      puzzle_date: wordSet.puzzle_date,
      user_id: user?.sub ?? null,
    })
    .returning();

  await cacheInvalidateLeaderboard(wordSet.puzzle_date);

  if (user?.sub) {
    await recalculateStreak(user.sub);
  }

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

// GET /api/leaderboard/daily — today's puzzle top scores, paginated, Redis-cached (5min TTL)
app.get('/leaderboard/daily', async (c) => {
  const { page, limit } = paginationSchema.parse(c.req.query());
  const offset = (page - 1) * limit;

  const [wordSet] = await db
    .select({ puzzle_date: word_sets.puzzle_date })
    .from(word_sets)
    .where(eq(word_sets.is_active, true))
    .limit(1);

  const today = wordSet?.puzzle_date ?? new Date().toISOString().slice(0, 10);
  const cacheKey = `lb:daily:${today}:${page}:${limit}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  const [entries, [{ total }]] = await Promise.all([
    db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.puzzle_date, today))
      .orderBy(asc(leaderboard.steps), asc(leaderboard.time_seconds))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`COUNT(*)::int` })
      .from(leaderboard)
      .where(eq(leaderboard.puzzle_date, today)),
  ]);

  const result = {
    data: entries.map((e) => ({
      id: e.id,
      name: e.player_name,
      steps: e.steps,
      timeSeconds: e.time_seconds,
      submittedAt: e.submitted_at,
    })),
    pagination: { page, limit, total },
  };

  await cacheSet(cacheKey, result);
  return c.json(result);
});

// GET /api/leaderboard/alltime — all-time top scores, paginated, Redis-cached (5min TTL)
app.get('/leaderboard/alltime', async (c) => {
  const { page, limit } = paginationSchema.parse(c.req.query());
  const offset = (page - 1) * limit;

  const cacheKey = `lb:alltime:${page}:${limit}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  const [entries, [{ total }]] = await Promise.all([
    db
      .select()
      .from(leaderboard)
      .orderBy(asc(leaderboard.steps), asc(leaderboard.time_seconds))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`COUNT(*)::int` }).from(leaderboard),
  ]);

  const result = {
    data: entries.map((e) => ({
      id: e.id,
      name: e.player_name,
      steps: e.steps,
      timeSeconds: e.time_seconds,
      submittedAt: e.submitted_at,
    })),
    pagination: { page, limit, total },
  };

  await cacheSet(cacheKey, result);
  return c.json(result);
});

const port = parseInt(process.env.PORT ?? '3001', 10);
// serve() returns an HTTP/1 server at runtime; cast needed due to Hono's union type
const httpServer = serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
  logger.info(`API listening on http://0.0.0.0:${port}`);
}) as unknown as HTTPServer;

attachSocketIO(httpServer);
