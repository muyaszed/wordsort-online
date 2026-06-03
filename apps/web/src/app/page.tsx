import { PuzzleGame } from "@/components/PuzzleGame";
import { DAILY_PUZZLE } from "@/lib/sample-data";

export default function Home() {
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
      <PuzzleGame puzzle={DAILY_PUZZLE} />
    </main>
  );
}
