import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { rateLimitIncr } from '@wordsort/db';
// Ensures ContextVariableMap augmentation for 'user' is in scope
import type { attachUser } from '../auth/middleware';

const PUBLIC_LIMIT = 100;
const AUTH_LIMIT = 500;
const WINDOW_SEC = 60;
const WINDOW_MS = WINDOW_SEC * 1000;

// In-memory fallback when Redis is unavailable
const memStore = new Map<string, number>();

function getClientIp(c: Parameters<MiddlewareHandler>[0]): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  );
}

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get('user');
  const identifier = user?.sub ?? getClientIp(c);
  const limit = user ? AUTH_LIMIT : PUBLIC_LIMIT;
  const windowSlot = Math.floor(Date.now() / WINDOW_MS);
  const key = `rl:${identifier}:${windowSlot}`;

  const redisCount = await rateLimitIncr(key, WINDOW_SEC);

  let count: number;
  if (redisCount !== null) {
    count = redisCount;
  } else {
    count = (memStore.get(key) ?? 0) + 1;
    memStore.set(key, count);

    if (memStore.size > 10_000) {
      const staleSlot = windowSlot - 2;
      for (const k of memStore.keys()) {
        const slot = parseInt(k.split(':').pop() ?? '0', 10);
        if (slot <= staleSlot) memStore.delete(k);
      }
    }
  }

  if (count > limit) {
    throw new HTTPException(429, { message: 'Too many requests' });
  }

  return next();
};
