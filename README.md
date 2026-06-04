# Wordsort

A word-sorting puzzle game. Slide tiles to arrange words in the correct order.

## Local Development

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- A PostgreSQL database (Neon is recommended — [console.neon.tech](https://console.neon.tech))

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure the database package
cp packages/db/.env.example packages/db/.env
# Edit packages/db/.env and set DATABASE_URL

# 3. Configure the API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and set DATABASE_URL (same value as above)

# 4. Push the schema to your database
pnpm --filter @wordsort/db db:push

# 5. Start all dev servers
pnpm dev
```

### Dev URLs

| App | URL |
|-----|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| WebSocket | ws://localhost:3001/ws |

### Individual apps

```bash
# Run only the API
pnpm --filter @wordsort/api dev

# Run only the web app
pnpm --filter @wordsort/web dev
```

## Project Structure

```
apps/
  api/    Hono REST API + Socket.IO server (port 3001)
  web/    Next.js frontend (port 3000)
packages/
  db/     Drizzle ORM schema + migrations
  game-logic/  Core puzzle engine (shared)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/words | Active word set for today's puzzle |
| POST | /api/scores | Submit a score to the leaderboard |
| GET | /api/leaderboard | Top scores (sorted by steps, then time) |
| WS | /ws | Socket.IO endpoint (connection/disconnect logging) |
