import 'dotenv/config';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required — set it in packages/db/.env or pass it inline');
}

const client = postgres(process.env.DATABASE_URL);

async function reset() {
  const url = new URL(process.env.DATABASE_URL!);
  console.log(`Resetting database at ${url.hostname}${url.pathname}…`);
  await client`DROP SCHEMA public CASCADE`;
  await client`DROP SCHEMA IF EXISTS drizzle CASCADE`;
  await client`CREATE SCHEMA public`;
  await client`GRANT ALL ON SCHEMA public TO neondb_owner`;
  await client`GRANT ALL ON SCHEMA public TO public`;
  console.log('Done. Run db:setup to recreate tables and seed data.');
  await client.end();
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
