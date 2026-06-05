#!/usr/bin/env bash
# Push DB schema to Neon + seed initial word set.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set."
  exit 1
fi

echo "==> Pushing schema..."
DATABASE_URL="$DATABASE_URL" pnpm --filter @wordsort/db db:push

echo "==> Seeding initial word set for today..."
TODAY=$(date +%Y-%m-%d)
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`INSERT INTO word_sets (puzzle_date, words, is_active)
    VALUES (\${$TODAY}, ARRAY['CRANE','FLUTE','GHOST','BRISK','LAMP'], true)
    ON CONFLICT (puzzle_date) DO NOTHING\`.then(() => {
  console.log('Seeded word set for ' + '$TODAY');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
" 2>/dev/null || echo "Seed via node failed - run the SQL manually in Neon console"

echo "==> Done."
