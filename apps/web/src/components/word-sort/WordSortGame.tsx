"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CategoryDef } from "@/lib/word-sort-types";
import { useWordSort } from "@/hooks/useWordSort";
import { BoardGrid } from "./BoardGrid";

interface WordSortGameProps {
  categories: CategoryDef[];
  title?: string;
}

export function WordSortGame({ categories, title }: WordSortGameProps) {
  const { state, registerZone, onTileDragEnd, reset } = useWordSort(categories);

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Header stats */}
      <div className="flex items-center gap-6 text-sm text-slate-500">
        <span>
          <span className="font-semibold text-slate-700">{state.solvedIds.length}</span>
          /{state.categories.length} solved
        </span>
        {state.mistakes > 0 && (
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

      {/* Win screen */}
      <AnimatePresence>
        {state.solved && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mt-2"
          >
            <p className="text-2xl font-bold text-emerald-600">
              {title ? `${title} — solved!` : "Puzzle complete!"}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {state.mistakes === 0
                ? "Perfect — no mistakes!"
                : `Finished with ${state.mistakes} mistake${state.mistakes !== 1 ? "s" : ""}`}
            </p>
            <button
              onClick={reset}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Play again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
