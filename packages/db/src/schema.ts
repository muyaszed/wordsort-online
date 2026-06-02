import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  score: integer("score").notNull().default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const words = pgTable("words", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
