import 'dotenv/config';
import { execSync } from 'child_process';

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

function run(label: string, url: string) {
  console.log(`\n=== ${label} ===`);
  const env = { ...process.env, DATABASE_URL: url };
  execSync('drizzle-kit migrate', { env, stdio: 'inherit' });
  execSync('tsx src/seed.ts', { env, stdio: 'inherit' });
}

run('Production database', prod);
run('Dev database', dev);
console.log('\nBoth databases are set up.');
