import { PuzzleGame } from "@/components/PuzzleGame";
import { fetchDailyWords } from "@/lib/api-client";
import { DAILY_PUZZLE, type PuzzleDefinition } from "@/lib/sample-data";

export default async function Home() {
  let puzzle: PuzzleDefinition = DAILY_PUZZLE;

  const wordSet = await fetchDailyWords();
  if (wordSet) {
    puzzle = {
      id: wordSet.id,
      date: wordSet.date,
      title: new Date(wordSet.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
      words: wordSet.words,
    };
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-dvh px-4 py-6 gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Wordsort
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Slide rows and columns to form words
        </p>
      </header>
      <PuzzleGame puzzle={puzzle} />
    </main>
  );
}
