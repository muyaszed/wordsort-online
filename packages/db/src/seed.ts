import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import { puzzles, categories, word_sets } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required — copy .env.example to .env and fill it in');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const SEED_PUZZLES = [
  {
    date: '2026-06-09',
    title: 'In the Kitchen',
    difficulty: 'easy' as const,
    categories: [
      { name: 'Cooking methods', words: ['BAKE', 'BOIL', 'FRY', 'ROAST'] },
      { name: 'Baked goods', words: ['BREAD', 'CAKE', 'ROLL', 'TART'] },
      { name: 'Kitchen tools', words: ['KNIFE', 'LADLE', 'PAN', 'WHISK'] },
      { name: 'Spices', words: ['CUMIN', 'DILL', 'SAGE', 'SALT'] },
    ],
  },
  {
    date: '2026-06-10',
    title: 'World Cities',
    difficulty: 'easy' as const,
    categories: [
      { name: 'European capitals', words: ['BERN', 'OSLO', 'PARIS', 'ROME'] },
      { name: 'Asian cities', words: ['DELHI', 'HANOI', 'SEOUL', 'TOKYO'] },
      { name: 'African capitals', words: ['ACCRA', 'CAIRO', 'DAKAR', 'TUNIS'] },
      { name: 'American cities', words: ['BELEM', 'LIMA', 'MIAMI', 'QUITO'] },
    ],
  },
  {
    date: '2026-06-11',
    title: 'Wild Kingdom',
    difficulty: 'medium' as const,
    categories: [
      { name: 'Big cats', words: ['LION', 'LYNX', 'PUMA', 'TIGER'] },
      { name: 'Birds of prey', words: ['EAGLE', 'HAWK', 'KITE', 'OWL'] },
      { name: 'Ocean animals', words: ['CRAB', 'SEAL', 'SHARK', 'WHALE'] },
      { name: 'Reptiles', words: ['COBRA', 'GECKO', 'NEWT', 'VIPER'] },
    ],
  },
  {
    date: '2026-06-12',
    title: 'Sports Day',
    difficulty: 'medium' as const,
    categories: [
      { name: 'Ball sports', words: ['GOLF', 'POLO', 'RUGBY', 'TENNIS'] },
      { name: 'Water sports', words: ['DIVE', 'ROW', 'SURF', 'SWIM'] },
      { name: 'Winter sports', words: ['CURL', 'SKATE', 'SKI', 'SLED'] },
      { name: 'Track & field', words: ['JUMP', 'RELAY', 'SHOT', 'SPRINT'] },
    ],
  },
  {
    date: '2026-06-13',
    title: 'Concert Hall',
    difficulty: 'medium' as const,
    categories: [
      { name: 'String instruments', words: ['BANJO', 'CELLO', 'HARP', 'VIOLA'] },
      { name: 'Woodwinds', words: ['FIFE', 'FLUTE', 'OBOE', 'PIPE'] },
      { name: 'Brass instruments', words: ['BUGLE', 'CORNET', 'HORN', 'TUBA'] },
      { name: 'Percussion', words: ['BONGO', 'DRUMS', 'GONG', 'TABLA'] },
    ],
  },
  {
    date: '2026-06-14',
    title: 'Weather Watch',
    difficulty: 'easy' as const,
    categories: [
      { name: 'Precipitation', words: ['HAIL', 'RAIN', 'SLEET', 'SNOW'] },
      { name: 'Storm types', words: ['GALE', 'GUST', 'SQUALL', 'STORM'] },
      { name: 'Sky conditions', words: ['CLEAR', 'FOGGY', 'HAZY', 'SUNNY'] },
      { name: 'Temperature', words: ['BALMY', 'COLD', 'MILD', 'WARM'] },
    ],
  },
  {
    date: '2026-06-15',
    title: 'Space Lab',
    difficulty: 'hard' as const,
    categories: [
      { name: 'Planets', words: ['EARTH', 'MARS', 'PLUTO', 'VENUS'] },
      { name: 'Space phenomena', words: ['COMET', 'MOON', 'NOVA', 'ORBIT'] },
      { name: 'Scientists', words: ['BOHR', 'CURIE', 'FERMI', 'TESLA'] },
      { name: 'Lab equipment', words: ['LASER', 'LENS', 'PRISM', 'SCOPE'] },
    ],
  },
  {
    date: '2026-06-16',
    title: 'European Tour',
    difficulty: 'medium' as const,
    categories: [
      { name: 'Countries', words: ['FRANCE', 'ITALY', 'SPAIN', 'WALES'] },
      { name: 'Languages', words: ['CZECH', 'GREEK', 'LATIN', 'WELSH'] },
      { name: 'Foods', words: ['CREPE', 'PASTA', 'TAPAS', 'WURST'] },
      { name: 'Landmarks', words: ['ALPS', 'FJORD', 'FORUM', 'TREVI'] },
    ],
  },
  {
    date: '2026-06-17',
    title: 'Street Food',
    difficulty: 'medium' as const,
    categories: [
      { name: 'Asian', words: ['BAO', 'RAMEN', 'SATAY', 'SUSHI'] },
      { name: 'Latin American', words: ['AREPA', 'ELOTE', 'NACHO', 'TACOS'] },
      { name: 'Middle Eastern', words: ['DOLMA', 'KEBAB', 'KOFTA', 'PITA'] },
      { name: 'European', words: ['BAGEL', 'BRAT', 'CREPE', 'PIDE'] },
    ],
  },
  {
    date: '2026-06-18',
    title: 'Safari Animals',
    difficulty: 'medium' as const,
    categories: [
      { name: 'Large mammals', words: ['BISON', 'HIPPO', 'RHINO', 'ZEBRA'] },
      { name: 'Primates', words: ['BABOON', 'CHIMP', 'GIBBON', 'LEMUR'] },
      { name: 'Birds', words: ['CRANE', 'EGRET', 'IBIS', 'STORK'] },
      { name: 'Insects', words: ['ANT', 'BEE', 'LOCUST', 'WASP'] },
    ],
  },
  {
    date: '2026-06-19',
    title: 'Biology Lab',
    difficulty: 'hard' as const,
    categories: [
      { name: 'Body organs', words: ['BRAIN', 'HEART', 'LIVER', 'LUNGS'] },
      { name: 'Genetics', words: ['DNA', 'GENE', 'HELIX', 'RNA'] },
      { name: 'Microbes', words: ['ALGAE', 'FUNGI', 'PRION', 'VIRUS'] },
      { name: 'Scientists', words: ['CRICK', 'CURIE', 'DARWIN', 'WATSON'] },
    ],
  },
  {
    date: '2026-06-20',
    title: 'Digital World',
    difficulty: 'hard' as const,
    categories: [
      { name: 'Hardware', words: ['CPU', 'GPU', 'RAM', 'ROM'] },
      { name: 'Storage', words: ['DISK', 'DRIVE', 'FLASH', 'TAPE'] },
      { name: 'Languages', words: ['JAVA', 'LISP', 'RUST', 'SWIFT'] },
      { name: 'Actions', words: ['CLICK', 'DRAG', 'SCROLL', 'SWIPE'] },
    ],
  },
  {
    date: '2026-06-21',
    title: 'Great Outdoors',
    difficulty: 'easy' as const,
    categories: [
      { name: 'Water bodies', words: ['LAKE', 'OCEAN', 'POND', 'RIVER'] },
      { name: 'Landforms', words: ['CLIFF', 'HILL', 'MESA', 'RIDGE'] },
      { name: 'Trees', words: ['BIRCH', 'ELM', 'OAK', 'PINE'] },
      { name: 'Activities', words: ['CAMP', 'CANOE', 'FISH', 'HIKE'] },
    ],
  },
  {
    date: '2026-06-22',
    title: 'Art Studio',
    difficulty: 'medium' as const,
    categories: [
      { name: 'Warm colors', words: ['CORAL', 'CREAM', 'OCHRE', 'PEACH'] },
      { name: 'Cool colors', words: ['AZURE', 'CYAN', 'JADE', 'TEAL'] },
      { name: 'Art mediums', words: ['CHALK', 'INK', 'OIL', 'PASTEL'] },
      { name: 'Art tools', words: ['BRUSH', 'EASEL', 'PEN', 'RULER'] },
    ],
  },
] satisfies Array<{
  date: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  categories: Array<{ name: string; words: string[] }>;
}>;

async function seed() {
  // Ensure migration 0005 has been applied; safe to run even if column already exists.
  await db.execute(
    sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0`,
  );

  console.log(`Seeding ${SEED_PUZZLES.length} puzzles…`);

  for (const p of SEED_PUZZLES) {
    // Upsert puzzle
    const existing = await db
      .select({ id: puzzles.id })
      .from(puzzles)
      .where(eq(puzzles.date, p.date))
      .limit(1);

    let puzzleId: string;

    if (existing.length > 0) {
      puzzleId = existing[0]!.id;
    } else {
      const [inserted] = await db
        .insert(puzzles)
        .values({
          date: p.date,
          title: p.title,
          difficulty: p.difficulty,
          generated_by: 'seed',
        })
        .returning({ id: puzzles.id });
      puzzleId = inserted!.id;
    }

    // Insert categories only if none exist for this puzzle
    const existingCats = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.puzzle_id, puzzleId))
      .limit(1);

    if (existingCats.length === 0) {
      await db.insert(categories).values(
        p.categories.map((cat, i) => ({
          puzzle_id: puzzleId,
          name: cat.name,
          words: cat.words,
          sort_order: i,
        })),
      );
    }

    // Keep word_sets in sync for backward compat (flat list of all words)
    const allWords = p.categories.flatMap((c) => c.words);
    await db
      .insert(word_sets)
      .values({ puzzle_date: p.date, words: allWords })
      .onConflictDoNothing();

    console.log(`  ✓ ${p.date} — ${p.title} (${p.difficulty})`);
  }

  console.log('Done.');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
