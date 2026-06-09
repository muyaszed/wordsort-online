import cron from 'node-cron';
import { createDb, word_sets, eq, cacheSetWithTTL } from '@wordsort/db';
import { logger } from './logger';

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
}

export async function rotateDailyPuzzle(db: ReturnType<typeof createDb>): Promise<void> {
  const today = todayUTC();

  const [todaySet] = await db
    .select()
    .from(word_sets)
    .where(eq(word_sets.puzzle_date, today))
    .limit(1);

  if (!todaySet) {
    logger.warn({ date: today }, 'No word set scheduled for today — skipping rotation');
    return;
  }

  await db.transaction(async (tx) => {
    await tx.update(word_sets).set({ is_active: false }).where(eq(word_sets.is_active, true));
    await tx.update(word_sets).set({ is_active: true }).where(eq(word_sets.id, todaySet.id));
  });

  const ttl = secondsUntilMidnightUTC();
  await cacheSetWithTTL(`puzzle:daily:${today}`, {
    id: todaySet.id,
    date: todaySet.puzzle_date,
    words: todaySet.words,
  }, ttl);

  logger.info({ date: today, ttlSeconds: ttl }, 'Daily puzzle rotated');
}

export function startScheduler(db: ReturnType<typeof createDb>): void {
  // Run on startup to handle server restarts mid-day
  rotateDailyPuzzle(db).catch((err) =>
    logger.error({ err }, 'Initial puzzle rotation failed'),
  );

  // Midnight UTC rotation
  cron.schedule(
    '0 0 * * *',
    () => {
      rotateDailyPuzzle(db).catch((err) =>
        logger.error({ err }, 'Scheduled puzzle rotation failed'),
      );
    },
    { timezone: 'UTC' },
  );

  logger.info('Daily puzzle scheduler started (0 0 * * * UTC)');
}
