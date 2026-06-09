import { Redis } from '@upstash/redis';

const LEADERBOARD_TTL = 300;
const SESSION_TTL = 86400;

let _initialized = false;
let _client: Redis | null = null;

function getClient(): Redis | null {
  if (!_initialized) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    _client = url && token ? new Redis({ url, token }) : null;
    _initialized = true;
  }
  return _client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getClient();
    if (!r) return null;
    return await r.get<T>(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  await cacheSetWithTTL(key, value, LEADERBOARD_TTL);
}

export async function cacheSetWithTTL(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const r = getClient();
    if (!r) return;
    await r.set(key, value, { ex: Math.max(1, ttlSeconds) });
  } catch {
    // ignore
  }
}

export async function rateLimitIncr(key: string, windowSec: number): Promise<number | null> {
  try {
    const r = getClient();
    if (!r) return null;
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, windowSec);
    return count;
  } catch {
    return null;
  }
}

export async function cacheInvalidateLeaderboard(puzzleDate: string): Promise<void> {
  try {
    const r = getClient();
    if (!r) return;
    for (const pattern of [`lb:daily:${puzzleDate}:*`, 'lb:alltime:*']) {
      const keys: string[] = [];
      let cursor: string | number = '0';
      do {
        const result: [string, string[]] = await r.scan(cursor, { match: pattern, count: 100 });
        cursor = result[0];
        const batch = result[1];
        keys.push(...batch);
      } while (cursor !== '0');
      if (keys.length) await r.del(...keys);
    }
  } catch {
    // ignore
  }
}

// Guest session store — TTL 24h by default
export async function sessionGet<T>(sessionId: string): Promise<T | null> {
  return cacheGet<T>(`session:${sessionId}`);
}

export async function sessionSet(sessionId: string, data: unknown, ttlSeconds = SESSION_TTL): Promise<void> {
  await cacheSetWithTTL(`session:${sessionId}`, data, ttlSeconds);
}

export async function sessionDel(sessionId: string): Promise<void> {
  try {
    const r = getClient();
    if (!r) return;
    await r.del(`session:${sessionId}`);
  } catch {
    // ignore
  }
}
