import { WordSortGame } from "@/components/word-sort/WordSortGame";
import { DailyPuzzleHeader } from "@/components/word-sort/DailyPuzzleHeader";
import { SAMPLE_SORT_CATEGORIES } from "@/lib/word-sort-sample";
import type { CategoryDef, ZoneColor } from "@/lib/word-sort-types";

export const dynamic = "force-dynamic";

const ZONE_COLORS: ZoneColor[] = ["yellow", "green", "blue", "purple"];

interface DailyPuzzleResponse {
  id: string;
  date: string;
  title: string;
  difficulty: string;
  categories: Array<{ id: string; name: string; words: string[] }>;
}

async function getDailyPuzzle(): Promise<DailyPuzzleResponse | null> {
  const apiUrl = process.env.API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/api/puzzles/daily`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<DailyPuzzleResponse>;
  } catch {
    return null;
  }
}

export default async function SortPage() {
  const puzzle = await getDailyPuzzle();

  const puzzleId = puzzle?.date ?? new Date().toISOString().slice(0, 10);

  const categories: CategoryDef[] = puzzle
    ? puzzle.categories.map((cat, i) => ({
        id: cat.id,
        name: cat.name,
        color: ZONE_COLORS[i % 4]!,
        words: cat.words,
      }))
    : SAMPLE_SORT_CATEGORIES;

  return (
    <main className="flex flex-col items-center justify-start min-h-dvh px-4 py-6 gap-6">
      <DailyPuzzleHeader puzzleId={puzzleId} title={puzzle?.title} />
      <WordSortGame
        categories={categories}
        puzzleId={puzzleId}
        title={puzzle?.title}
      />
    </main>
  );
}
