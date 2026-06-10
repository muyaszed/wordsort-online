"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CategoryDef } from "@/lib/word-sort-types";
import { useWordSort } from "@/hooks/useWordSort";
import { getGuestSessionId } from "@/lib/guest-session";
import { BoardGrid } from "./BoardGrid";
import { ScoreSummary } from "./ScoreSummary";

interface WordSortGameProps {
  categories: CategoryDef[];
  title?: string;
}

export function WordSortGame({ categories, title }: WordSortGameProps) {
  const { state, registerZone, onTileDragEnd, reset } = useWordSort(categories);

  useEffect(() => {
    getGuestSessionId();
  }, []);

  const elapsedMs =
    state.solvedAt != null && state.startedAt != null
      ? state.solvedAt - state.startedAt
      : 0;

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
            onPlayAgain={reset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
