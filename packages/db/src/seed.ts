import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { puzzles, word_sets } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required — copy .env.example to .env and fill it in');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// 14 days of daily puzzles (2026-06-09 → 2026-06-22)
// Each word set: 4 five-letter words + 1 four-letter word (21 tiles total)
const SEED_PUZZLES = [
  {
    date: '2026-06-09',
    title: 'Kitchen Classics',
    difficulty: 'easy' as const,
    words: ['BREAD', 'PIZZA', 'PASTA', 'SALAD', 'CAKE'],
  },
  {
    date: '2026-06-10',
    title: 'World Capitals',
    difficulty: 'easy' as const,
    words: ['PARIS', 'JAPAN', 'CAIRO', 'INDIA', 'ROME'],
  },
  {
    date: '2026-06-11',
    title: 'Wild Kingdom',
    difficulty: 'medium' as const,
    words: ['TIGER', 'EAGLE', 'SHARK', 'RAVEN', 'BEAR'],
  },
  {
    date: '2026-06-12',
    title: 'On the Field',
    difficulty: 'medium' as const,
    words: ['BOXER', 'RUGBY', 'RELAY', 'GOALS', 'SWIM'],
  },
  {
    date: '2026-06-13',
    title: 'Concert Hall',
    difficulty: 'medium' as const,
    words: ['PIANO', 'DRUMS', 'VIOLA', 'BANJO', 'LUTE'],
  },
  {
    date: '2026-06-14',
    title: 'Weather Watch',
    difficulty: 'easy' as const,
    words: ['STORM', 'CLOUD', 'RAINY', 'SUNNY', 'SNOW'],
  },
  {
    date: '2026-06-15',
    title: 'Space Lab',
    difficulty: 'hard' as const,
    words: ['ATOMS', 'LASER', 'SOLAR', 'ORBIT', 'CELL'],
  },
  {
    date: '2026-06-16',
    title: 'European Tour',
    difficulty: 'medium' as const,
    words: ['SPAIN', 'ITALY', 'CHINA', 'WALES', 'PERU'],
  },
  {
    date: '2026-06-17',
    title: 'Street Food',
    difficulty: 'medium' as const,
    words: ['SUSHI', 'TACOS', 'BAGEL', 'CREPE', 'RICE'],
  },
  {
    date: '2026-06-18',
    title: 'Safari Animals',
    difficulty: 'medium' as const,
    words: ['BISON', 'KOALA', 'MOOSE', 'OTTER', 'SEAL'],
  },
  {
    date: '2026-06-19',
    title: 'Biology Lab',
    difficulty: 'hard' as const,
    words: ['GENES', 'VIRUS', 'BRAIN', 'NERVE', 'BONE'],
  },
  {
    date: '2026-06-20',
    title: 'Digital World',
    difficulty: 'hard' as const,
    words: ['ROBOT', 'DRIVE', 'CLICK', 'PIXEL', 'CHIP'],
  },
  {
    date: '2026-06-21',
    title: 'Great Outdoors',
    difficulty: 'easy' as const,
    words: ['RIVER', 'OCEAN', 'FIELD', 'GROVE', 'HILL'],
  },
  {
    date: '2026-06-22',
    title: 'Art Studio',
    difficulty: 'medium' as const,
    words: ['PAINT', 'BRUSH', 'COLOR', 'DRAMA', 'BLUE'],
  },
] satisfies Array<{
  date: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  words: string[];
}>;

async function seed() {
  console.log(`Seeding ${SEED_PUZZLES.length} puzzles…`);

  for (const puzzle of SEED_PUZZLES) {
    await db
      .insert(word_sets)
      .values({ puzzle_date: puzzle.date, words: puzzle.words })
      .onConflictDoNothing();

    await db
      .insert(puzzles)
      .values({
        date: puzzle.date,
        title: puzzle.title,
        difficulty: puzzle.difficulty,
        generated_by: 'seed',
      })
      .onConflictDoNothing();

    console.log(`  ✓ ${puzzle.date} — ${puzzle.title} (${puzzle.difficulty})`);
  }

  console.log('Done.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
