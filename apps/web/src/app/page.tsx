import { PuzzleGame } from "@/components/PuzzleGame";
import { DAILY_PUZZLE } from "@/lib/sample-data";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start px-4 py-6 gap-6">
      <PuzzleGame puzzle={DAILY_PUZZLE} />
    </div>
  );
}
