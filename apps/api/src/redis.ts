import Redis from 'ioredis';

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!_redis) {
    _redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      enableReadyCheck: false,
      maxRetriesPerRequest: 1,
    });
    _redis.on('error', () => {
      _redis = null;
    });
  }
  return _redis;
}

const TTL = 300;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    if (!r) return null;
    const val = await r.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    await r.set(key, JSON.stringify(value), 'EX', TTL);
  } catch {
    // ignore
  }
}

export async function cacheInvalidateLeaderboard(puzzleDate: string): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    for (const pattern of [`lb:daily:${puzzleDate}:*`, 'lb:alltime:*']) {
      const stream = r.scanStream({ match: pattern, count: 100 });
      const keys: string[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (batch: string[]) => keys.push(...batch));
        stream.on('end', resolve);
        stream.on('error', reject);
      });
      if (keys.length) await r.del(...keys);
    }
  } catch {
    // ignore
  }
}
