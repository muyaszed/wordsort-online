import { PuzzleGame } from "@/components/PuzzleGame";
import { DAILY_PUZZLE } from "@/lib/sample-data";
import type { PuzzleDefinition } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

interface WordSetResponse {
  id: string;
  date: string;
  title: string;
  words: string[];
}

async function getDailyWordSet(): Promise<WordSetResponse | null> {
  const apiUrl = process.env.API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/api/words`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<WordSetResponse>;
  } catch {
    return null;
  }
}

export default async function Home() {
  const wordSet = await getDailyWordSet();

  const puzzle: PuzzleDefinition = wordSet
    ? {
        id: wordSet.date,
        date: wordSet.date,
        title: wordSet.title,
        words: wordSet.words,
      }
    : DAILY_PUZZLE;

  return (
    <div className="flex flex-col items-center justify-start px-3 sm:px-4 py-4 sm:py-6 gap-4 sm:gap-6">
      <PuzzleGame puzzle={puzzle} />
    </div>
  );
}
