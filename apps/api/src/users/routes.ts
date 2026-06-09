import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { createDb, users, leaderboard, eq, desc, sql } from '@wordsort/db';
import { requireAuth } from '../auth/middleware';

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const updateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username may only contain letters, numbers, underscores, and hyphens'),
});

/**
 * Recalculates streak from leaderboard history and persists it to users.streak.
 * Streak = consecutive days (ending at most recent play date) with at least one entry.
 * A streak is considered alive if the user last played today or yesterday.
 */
export async function recalculateStreak(userId: string): Promise<number> {
  const db = getDb();

  const rows = await db
    .selectDistinct({ date: leaderboard.puzzle_date })
    .from(leaderboard)
    .where(eq(leaderboard.user_id, userId))
    .orderBy(desc(leaderboard.puzzle_date));

  if (rows.length === 0) {
    await db.update(users).set({ streak: 0 }).where(eq(users.id, userId));
    return 0;
  }

  const today = new Date().toISOString().slice(0, 10);
  const dates = rows.map((r) => r.date as string);
  const lastPlayed = dates[0];

  const msPerDay = 86_400_000;
  const gapFromToday = Math.round(
    (new Date(today).getTime() - new Date(lastPlayed).getTime()) / msPerDay,
  );

  let streak = 0;
  if (gapFromToday <= 1) {
    let expected = lastPlayed;
    for (const date of dates) {
      const diff = Math.round(
        (new Date(expected).getTime() - new Date(date).getTime()) / msPerDay,
      );
      if (diff === 0) {
        streak++;
        const d = new Date(expected);
        d.setDate(d.getDate() - 1);
        expected = d.toISOString().slice(0, 10);
      } else {
        break;
      }
    }
  }

  await db.update(users).set({ streak }).where(eq(users.id, userId));
  return streak;
}

export const usersRouter = new Hono();

// GET /users/me — current user profile with up-to-date streak
usersRouter.get('/me', requireAuth, async (c) => {
  const { sub: userId } = c.get('user')!;
  const db = getDb();

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  const streak = await recalculateStreak(userId);

  return c.json({
    id: user.id,
    username: user.username,
    email: user.email ?? null,
    streak,
    isGuest: user.is_guest,
    createdAt: user.created_at,
  });
});

// GET /users/me/scores — paginated score history for the authenticated user
usersRouter.get('/me/scores', requireAuth, async (c) => {
  const { sub: userId } = c.get('user')!;
  const { page, limit } = paginationSchema.parse(c.req.query());
  const offset = (page - 1) * limit;
  const db = getDb();

  const [entries, [{ total }]] = await Promise.all([
    db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.user_id, userId))
      .orderBy(desc(leaderboard.submitted_at))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`COUNT(*)::int` })
      .from(leaderboard)
      .where(eq(leaderboard.user_id, userId)),
  ]);

  return c.json({
    data: entries.map((e) => ({
      id: e.id,
      steps: e.steps,
      timeSeconds: e.time_seconds,
      puzzleDate: e.puzzle_date,
      submittedAt: e.submitted_at,
    })),
    pagination: { page, limit, total },
  });
});

// PATCH /users/me — update username
usersRouter.patch('/me', requireAuth, async (c) => {
  const { sub: userId } = c.get('user')!;

  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body' });
  }

  const { username } = updateUserSchema.parse(raw);
  const db = getDb();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing && existing.id !== userId) {
    throw new HTTPException(409, { message: 'Username already taken' });
  }

  const [updated] = await db
    .update(users)
    .set({ username })
    .where(eq(users.id, userId))
    .returning();

  return c.json({
    id: updated.id,
    username: updated.username,
    email: updated.email ?? null,
    streak: updated.streak,
    isGuest: updated.is_guest,
    createdAt: updated.created_at,
  });
});
