import { WordSortGame } from "@/components/word-sort/WordSortGame";
import { DailyPuzzleHeader } from "@/components/word-sort/DailyPuzzleHeader";
import { SAMPLE_SORT_CATEGORIES } from "@/lib/word-sort-sample";

export default function SortPage() {
  const puzzleId = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex flex-col items-center justify-start min-h-dvh px-4 py-6 gap-6">
      <DailyPuzzleHeader puzzleId={puzzleId} />
      <WordSortGame
        categories={SAMPLE_SORT_CATEGORIES}
        puzzleId={puzzleId}
      />
    </main>
  );
}
