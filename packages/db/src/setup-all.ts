import 'dotenv/config';
import { execSync } from 'child_process';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';

const prod = process.env.DATABASE_URL;
const dev = process.env.DATABASE_URL_DEV;

if (!prod || !dev) {
  console.error(
    'Error: both DATABASE_URL and DATABASE_URL_DEV must be set in packages/db/.env\n' +
    '\nExample:\n' +
    '  DATABASE_URL=postgresql://...prod...\n' +
    '  DATABASE_URL_DEV=postgresql://...dev...',
  );
  process.exit(1);
}

const migrationsFolder = path.join(__dirname, '..', 'drizzle');

async function setup(label: string, url: string) {
  console.log(`\n=== ${label} ===`);

  // Run migrations programmatically — avoids drizzle-kit CLI reloading .env
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder });
  await client.end();
  console.log('  ✓ migrations applied');

  // Seed against the same URL
  execSync('tsx src/seed.ts', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });
}

(async () => {
  await setup('Production database', prod);
  await setup('Dev database', dev);
  console.log('\nBoth databases are set up.');
})().catch((err) => {
  console.error('setup-all failed:', err);
  process.exit(1);
});
