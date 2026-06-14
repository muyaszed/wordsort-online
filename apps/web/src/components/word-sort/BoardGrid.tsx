"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { WordSortState } from "@/lib/word-sort-types";
import { CategoryZone } from "./CategoryZone";
import { WordTile } from "./WordTile";

interface BoardGridProps {
  state: WordSortState;
  onRegisterZone: (categoryId: string, el: HTMLElement | null) => void;
  onTileDragEnd: (tileId: string, x: number, y: number) => void;
}

export function BoardGrid({
  state,
  onRegisterZone,
  onTileDragEnd,
}: BoardGridProps) {
  const poolTiles = state.tiles.filter((t) => t.categoryId === null);

  return (
    <div className="flex flex-col gap-3 sm:gap-5 w-full max-w-xl mx-auto overflow-x-hidden">
      {/* 2×2 grid of category zones */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {state.categories.map((category) => {
          const categoryTiles = state.tiles.filter(
            (t) => t.categoryId === category.id
          );
          return (
            <CategoryZone
              key={category.id}
              category={category}
              tiles={categoryTiles}
              isSolved={state.solvedIds.includes(category.id)}
              onRegister={onRegisterZone}
              onTileDragEnd={onTileDragEnd}
            />
          );
        })}
      </div>

      {/* Word pool */}
      <motion.div
        layout
        className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-3 sm:p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Words to sort
        </p>
        <div className="flex flex-wrap gap-2 min-h-[2.75rem]">
          <AnimatePresence>
            {poolTiles.map((tile) => (
              <motion.div
                key={tile.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18 }}
              >
                <WordTile tile={tile} onDragEnd={onTileDragEnd} />
              </motion.div>
            ))}
          </AnimatePresence>

          {poolTiles.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-slate-400 italic self-center"
            >
              All words sorted!
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
