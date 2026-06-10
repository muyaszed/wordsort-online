import { WordSortGame } from "@/components/word-sort/WordSortGame";
import { SAMPLE_SORT_CATEGORIES } from "@/lib/word-sort-sample";

export default function SortPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-dvh px-4 py-6 gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          WordSort
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Drag words into the right categories
        </p>
      </header>
      <WordSortGame
        categories={SAMPLE_SORT_CATEGORIES}
        title="June 9"
      />
    </main>
  );
}
