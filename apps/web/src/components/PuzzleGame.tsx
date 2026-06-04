"use client";

import type { PuzzleDefinition } from "@/lib/sample-data";
import { usePuzzle } from "@/hooks/usePuzzle";
import { GameHeader } from "./GameHeader";
import { PuzzleGrid } from "./PuzzleGrid";
import { SolveScreen } from "./SolveScreen";

interface PuzzleGameProps {
  puzzle: PuzzleDefinition;
}

export function PuzzleGame({ puzzle }: PuzzleGameProps) {
  const {
    state,
    elapsedMs,
    slideColUp,
    slideColDown,
    reset,
  } = usePuzzle(puzzle.words);

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <GameHeader
        elapsedMs={elapsedMs}
        moveCount={state.moveCount}
        started={state.startedAt !== null}
        title={puzzle.title}
      />

      <PuzzleGrid
        grid={state.grid}
        targetWords={state.targetWords}
        onSlideColUp={slideColUp}
        onSlideColDown={slideColDown}
      />

      {state.solved && (
        <SolveScreen
          elapsedMs={elapsedMs}
          moveCount={state.moveCount}
          puzzleTitle={puzzle.title}
          onReset={reset}
        />
      )}
    </div>
  );
}
