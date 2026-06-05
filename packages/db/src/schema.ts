import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';

export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);
export const puzzleStatusEnum = pgEnum('puzzle_status', ['draft', 'reviewed', 'published']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique(),
  username: text('username').notNull().unique(),
  streak: integer('streak').notNull().default(0),
  is_guest: boolean('is_guest').notNull().default(false),
  password_hash: text('password_hash'),
  google_id: text('google_id').unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const refresh_tokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const puzzles = pgTable('puzzles', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: date('date').notNull().unique(),
  title: text('title').notNull(),
  difficulty: difficultyEnum('difficulty').notNull().default('medium'),
  published_at: timestamp('published_at'),
  generated_by: text('generated_by'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Each category belongs to one puzzle; words is a PostgreSQL text[] array.
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  puzzle_id: uuid('puzzle_id')
    .notNull()
    .references(() => puzzles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  words: text('words').array().notNull(),
});

export const scores = pgTable('scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  puzzle_id: uuid('puzzle_id')
    .notNull()
    .references(() => puzzles.id, { onDelete: 'cascade' }),
  time_ms: integer('time_ms').notNull(),
  mistakes: integer('mistakes').notNull().default(0),
  solved_at: timestamp('solved_at').notNull().defaultNow(),
});

export const puzzle_queue = pgTable('puzzle_queue', {
  id: uuid('id').defaultRandom().primaryKey(),
  puzzle_id: uuid('puzzle_id')
    .notNull()
    .unique()
    .references(() => puzzles.id, { onDelete: 'cascade' }),
  status: puzzleStatusEnum('status').notNull().default('draft'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Daily word sets for the wordsort game (4×5-letter + 1×4-letter words)
export const word_sets = pgTable('word_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  puzzle_date: date('puzzle_date').notNull().unique(),
  words: text('words').array().notNull(),
  is_active: boolean('is_active').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Anonymous leaderboard entries
export const leaderboard = pgTable('leaderboard', {
  id: uuid('id').defaultRandom().primaryKey(),
  player_name: text('player_name').notNull(),
  steps: integer('steps').notNull(),
  time_seconds: integer('time_seconds').notNull(),
  submitted_at: timestamp('submitted_at').notNull().defaultNow(),
});
