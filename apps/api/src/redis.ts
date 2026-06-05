import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    client.on('error', (err: Error) => {
      console.error('[Redis]', err.message);
    });
  }
  return client;
}

export function dailyPuzzleTtl(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.max(1, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}
