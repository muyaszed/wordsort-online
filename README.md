# Wordsort

A word-sorting puzzle game. Slide tiles to arrange words in the correct order.

## Local Development

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Access to a Neon PostgreSQL database ([console.neon.tech](https://console.neon.tech))

### Database Branches

This project uses **Neon branch-per-environment**:

| Environment | Neon Branch | Used by |
|-------------|-------------|---------|
| Production  | `main`      | Railway deployment |
| Development | `development` | Local dev & CI |

Always use the **development branch** connection string for local work. Ask a team member for the current `DATABASE_URL` if you don't have it, or get it from the Neon console under the `development` branch.

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure the database package
cp packages/db/.env.example packages/db/.env
# Edit packages/db/.env — set DATABASE_URL to the development branch URL

# 3. Configure the API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — set DATABASE_URL to the same development branch URL
# Generate a JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 4. Push the schema to your database (first time only, or after schema changes)
pnpm --filter @wordsort/db db:push

# 5. (Optional) Seed sample puzzles
pnpm --filter @wordsort/db db:seed

# 6. Start all dev servers
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

### Database tools

```bash
# Push local schema changes to DB (no migration files)
pnpm --filter @wordsort/db db:push

# Generate migration files from schema diff
pnpm --filter @wordsort/db db:generate

# Apply pending migrations
pnpm --filter @wordsort/db db:migrate

# Open Drizzle Studio (visual DB browser)
pnpm --filter @wordsort/db db:studio

# Seed the database with sample puzzles
pnpm --filter @wordsort/db db:seed
```

### Environment variables reference

#### `packages/db/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon development branch connection string |

#### `apps/api/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Same Neon development branch URL as above |
| `JWT_SECRET` | Yes | 32-byte base64 secret for signing JWTs |
| `PORT` | No | API port (default: `3001`) |
| `NODE_ENV` | No | Set to `development` locally (default: `development`) |
| `WEB_ORIGIN` | No | CORS origin (default: `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth — leave blank to disable |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth — leave blank to disable |
| `GOOGLE_REDIRECT_URI` | No | Google OAuth callback URL |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL — caching degrades gracefully if unset |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |

## Project Structure

```
apps/
  api/         Hono REST API + Socket.IO server (port 3001)
  web/         Next.js frontend (port 3000)
packages/
  db/          Drizzle ORM schema, migrations, seed
  game-logic/  Core puzzle engine (shared, framework-agnostic)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/words | Active word set for today's puzzle |
| POST | /api/scores | Submit a score to the leaderboard |
| GET | /api/leaderboard | Top scores (sorted by steps, then time) |
| WS | /ws | Socket.IO endpoint (connection/disconnect logging) |
