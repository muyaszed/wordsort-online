import { WordSortGame } from "@/components/word-sort/WordSortGame";
import type { CategoryDef } from "@/lib/word-sort-types";

const SAMPLE_CATEGORIES: CategoryDef[] = [
  {
    id: "fruits",
    name: "Fruits",
    color: "yellow",
    words: ["APPLE", "BANANA", "CHERRY", "MANGO"],
  },
  {
    id: "colors",
    name: "Colors",
    color: "blue",
    words: ["RED", "BLUE", "GREEN", "GOLD"],
  },
  {
    id: "animals",
    name: "Animals",
    color: "green",
    words: ["CAT", "DOG", "FOX", "OWL"],
  },
  {
    id: "sports",
    name: "Sports",
    color: "purple",
    words: ["GOLF", "POLO", "YOGA", "SWIM"],
  },
];

export default function WordSortPage() {
  return (
    <div className="flex flex-col items-center justify-start px-4 py-6 gap-6 w-full">
      <WordSortGame
        categories={SAMPLE_CATEGORIES}
        puzzleId="word-sort-sample"
        title="Word Sort"
      />
    </div>
  );
}
