#!/usr/bin/env bash
# Deploy API to Railway. Requires RAILWAY_TOKEN in environment.
set -euo pipefail

if [ -z "${RAILWAY_TOKEN:-}" ]; then
  echo "ERROR: RAILWAY_TOKEN not set. Get it from railway.app → Settings → Tokens"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set."
  exit 1
fi

echo "==> Logging in to Railway..."
railway login --token "$RAILWAY_TOKEN" --browserless 2>/dev/null || true

echo "==> Linking project (create if doesn't exist)..."
railway link --environment production 2>/dev/null || railway init --name wordsort-api --environment production

echo "==> Setting environment variables..."
railway variables set \
  DATABASE_URL="$DATABASE_URL" \
  JWT_SECRET="$JWT_SECRET" \
  NODE_ENV=production \
  PORT=3001 \
  ${REDIS_URL:+REDIS_URL="$REDIS_URL"} \
  ${WEB_ORIGIN:+WEB_ORIGIN="$WEB_ORIGIN"}

echo "==> Deploying API..."
railway up --detach

echo "==> Deployment triggered. Check https://railway.app for status."
