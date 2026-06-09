ALTER TABLE "leaderboard" ADD COLUMN "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leaderboard_user_id_idx" ON "leaderboard" ("user_id");
