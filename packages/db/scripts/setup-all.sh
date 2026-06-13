#!/usr/bin/env bash
set -e

if [ -z "$DATABASE_URL" ] || [ -z "$DATABASE_URL_DEV" ]; then
  echo "Error: both DATABASE_URL and DATABASE_URL_DEV must be set."
  echo "Usage: DATABASE_URL=\"<prod-url>\" DATABASE_URL_DEV=\"<dev-url>\" pnpm --filter @wordsort/db db:setup:all"
  exit 1
fi

echo "=== Production database ==="
drizzle-kit migrate
tsx src/seed.ts

echo ""
echo "=== Dev database ==="
DATABASE_URL="$DATABASE_URL_DEV" drizzle-kit migrate
DATABASE_URL="$DATABASE_URL_DEV" tsx src/seed.ts

echo ""
echo "Both databases are set up."
