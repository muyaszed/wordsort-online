#!/usr/bin/env bash
# Deploy web app to Vercel. Requires VERCEL_TOKEN and NEXT_PUBLIC_API_URL.
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "ERROR: VERCEL_TOKEN not set. Get it from vercel.com → Settings → Tokens"
  exit 1
fi

if [ -z "${NEXT_PUBLIC_API_URL:-}" ]; then
  echo "ERROR: NEXT_PUBLIC_API_URL not set (e.g. https://wordsort-api.up.railway.app/api)"
  exit 1
fi

echo "==> Deploying web to Vercel..."
cd apps/web
vercel --token "$VERCEL_TOKEN" \
  --env NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  --yes \
  --prod

echo "==> Web deployment complete."
