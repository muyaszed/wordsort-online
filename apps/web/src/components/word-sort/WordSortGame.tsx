"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CategoryDef } from "@/lib/word-sort-types";
import { useWordSort } from "@/hooks/useWordSort";
import { getGuestSessionId } from "@/lib/guest-session";
import { useGameStore } from "@/store/game-store";
import { buildShareSquares, buildShareText } from "@/lib/daily-puzzle";
import { BoardGrid } from "./BoardGrid";
import { ScoreSummary } from "./ScoreSummary";
import { AlreadyPlayedView } from "./AlreadyPlayedView";

interface WordSortGameProps {
  categories: CategoryDef[];
  puzzleId?: string;
  title?: string;
}

export function WordSortGame({ categories, puzzleId, title }: WordSortGameProps) {
  const { state, registerZone, onTileDragEnd, reset } = useWordSort(categories);
  const { markPuzzleCompleted, isPuzzleCompleted, completedPuzzles } = useGameStore();
  const markedRef = useRef(false);

  useEffect(() => {
    getGuestSessionId();
  }, []);

  // Mark completed on first solve
  useEffect(() => {
    if (state.solved && puzzleId && !markedRef.current && !isPuzzleCompleted(puzzleId)) {
      markedRef.current = true;
      const elapsedMs =
        state.solvedAt != null && state.startedAt != null
          ? state.solvedAt - state.startedAt
          : 0;
      const squares = buildShareSquares(state.solvedIds, state.categories);
      markPuzzleCompleted(puzzleId, elapsedMs, state.mistakes, squares);
    }
  }, [
    state.solved,
    state.solvedAt,
    state.startedAt,
    state.solvedIds,
    state.categories,
    state.mistakes,
    puzzleId,
    isPuzzleCompleted,
    markPuzzleCompleted,
  ]);

  const elapsedMs =
    state.solvedAt != null && state.startedAt != null
      ? state.solvedAt - state.startedAt
      : 0;

  // Show already-played view if puzzle was completed before this session
  if (puzzleId && isPuzzleCompleted(puzzleId) && !state.solved) {
    const result = completedPuzzles[puzzleId];
    const shareText = buildShareText({
      puzzleId,
      title,
      mistakes: result.mistakes,
      elapsedMs: result.elapsedMs,
      shareSquares: result.shareSquares,
    });
    return (
      <AlreadyPlayedView
        puzzleId={puzzleId}
        title={title}
        elapsedMs={result.elapsedMs}
        mistakes={result.mistakes}
        shareText={shareText}
      />
    );
  }

  const shareText =
    state.solved && puzzleId
      ? buildShareText({
          puzzleId,
          title,
          mistakes: state.mistakes,
          elapsedMs,
          shareSquares: buildShareSquares(state.solvedIds, state.categories),
        })
      : undefined;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Header stats */}
      <div className="flex items-center gap-6 text-sm text-slate-500">
        <span>
          <span className="font-semibold text-slate-700">{state.solvedIds.length}</span>
          /{state.categories.length} solved
        </span>
        {state.mistakes > 0 && !state.solved && (
          <motion.span
            key={state.mistakes}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-red-500 font-medium"
          >
            {state.mistakes} mistake{state.mistakes !== 1 ? "s" : ""}
          </motion.span>
        )}
      </div>

      <BoardGrid
        state={state}
        onRegisterZone={registerZone}
        onTileDragEnd={onTileDragEnd}
      />

      <AnimatePresence>
        {state.solved && (
          <ScoreSummary
            title={title}
            elapsedMs={elapsedMs}
            mistakes={state.mistakes}
            shareText={shareText}
            onPlayAgain={reset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
