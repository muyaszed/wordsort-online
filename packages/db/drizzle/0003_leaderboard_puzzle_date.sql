ALTER TABLE "leaderboard" ADD COLUMN "puzzle_date" date NOT NULL DEFAULT CURRENT_DATE;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leaderboard_puzzle_date_idx" ON "leaderboard" ("puzzle_date");
