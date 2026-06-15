"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import type { WordSortState } from "@/lib/word-sort-types";
import { CategoryZone } from "./CategoryZone";
import { WordTile } from "./WordTile";

interface BoardGridProps {
  state: WordSortState;
  onRegisterZone: (categoryId: string, el: HTMLElement | null) => void;
  onTileDragEnd: (tileId: string, x: number, y: number) => void;
  onKeyboardPlace: (tileId: string, categoryId: string) => void;
}

export function BoardGrid({
  state,
  onRegisterZone,
  onTileDragEnd,
  onKeyboardPlace,
}: BoardGridProps) {
  const poolTiles = state.tiles.filter((t) => t.categoryId === null);
  const [heldTileId, setHeldTileId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const cellRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const tileRefs = useRef<Map<string, HTMLElement>>(new Map());
  const prevSolvedIdsRef = useRef<string[]>([]);
  const prevSolvedRef = useRef(false);

  // Clear announcement after a beat so the same text can re-trigger
  useEffect(() => {
    if (!announcement) return;
    const t = setTimeout(() => setAnnouncement(""), 1500);
    return () => clearTimeout(t);
  }, [announcement]);

  // Announce category solves and puzzle completion
  useEffect(() => {
    if (state.solved && !prevSolvedRef.current) {
      prevSolvedRef.current = true;
      setAnnouncement("Puzzle complete! All categories solved.");
    } else {
      const newlySolved = state.solvedIds.filter(
        (id) => !prevSolvedIdsRef.current.includes(id)
      );
      if (newlySolved.length > 0) {
        const cat = state.categories.find((c) => c.id === newlySolved[0]);
        if (cat) setAnnouncement(`${cat.name} complete!`);
      }
    }
    prevSolvedIdsRef.current = state.solvedIds;
  }, [state.solvedIds, state.solved, state.categories]);

  const pickUpTile = useCallback(
    (tileId: string) => {
      setHeldTileId(tileId);
      const firstUnsolvedIndex = state.categories.findIndex(
        (c) => !state.solvedIds.includes(c.id)
      );
      const targetIndex = firstUnsolvedIndex >= 0 ? firstUnsolvedIndex : 0;
      requestAnimationFrame(() => {
        cellRefs.current[targetIndex]?.focus();
      });
    },
    [state.categories, state.solvedIds]
  );

  const cancelHold = useCallback(() => {
    const id = heldTileId;
    setHeldTileId(null);
    if (id) {
      requestAnimationFrame(() => {
        tileRefs.current.get(id)?.focus();
      });
    }
  }, [heldTileId]);

  const dropIntoZone = useCallback(
    (zoneIndex: number) => {
      if (!heldTileId) return;
      const category = state.categories[zoneIndex];
      if (!category || state.solvedIds.includes(category.id)) return;
      const tile = state.tiles.find((t) => t.id === heldTileId);
      if (!tile) return;

      const isCorrect = category.words.includes(tile.word);
      setAnnouncement(
        isCorrect
          ? `Correct. ${tile.word} placed in ${category.name}.`
          : `Incorrect. ${tile.word} does not belong in ${category.name}.`
      );

      const placedTileId = heldTileId;
      onKeyboardPlace(placedTileId, category.id);
      setHeldTileId(null);

      if (!isCorrect) {
        // Tile stays in pool (incorrect state); return focus to it
        requestAnimationFrame(() => {
          tileRefs.current.get(placedTileId)?.focus();
        });
      }
    },
    [heldTileId, state, onKeyboardPlace]
  );

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (!heldTileId) return;
      const n = state.categories.length;
      const cols = 2;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        dropIntoZone(index);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        cellRefs.current[(index + 1) % n]?.focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        cellRefs.current[(index - 1 + n) % n]?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        cellRefs.current[(index + cols) % n]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        cellRefs.current[(index - cols + n) % n]?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelHold();
      }
    },
    [heldTileId, state.categories.length, dropIntoZone, cancelHold]
  );

  const rows = [
    state.categories.slice(0, 2),
    state.categories.slice(2, 4),
  ];

  return (
    <div className="flex flex-col gap-3 sm:gap-5 w-full max-w-xl mx-auto overflow-x-hidden">
      {/* Screen-reader live announcement region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* 2×2 ARIA grid of category drop zones */}
      <div role="grid" aria-label="Category zones" className="grid grid-cols-2 gap-2 sm:gap-4">
        {rows.map((rowCats, rowIndex) => (
          <div key={rowIndex} role="row" className="contents">
            {rowCats.map((category, colIndex) => {
              const zoneIndex = rowIndex * 2 + colIndex;
              const categoryTiles = state.tiles.filter(
                (t) => t.categoryId === category.id
              );
              const isSolved = state.solvedIds.includes(category.id);
              return (
                <div
                  key={category.id}
                  role="gridcell"
                  ref={(el) => {
                    cellRefs.current[zoneIndex] = el;
                  }}
                  tabIndex={heldTileId ? 0 : -1}
                  onKeyDown={(e) => handleCellKeyDown(e, zoneIndex)}
                  aria-label={`${category.name}${isSolved ? ", solved" : ""}`}
                  className={[
                    "outline-none rounded-2xl",
                    heldTileId
                      ? "focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      : "",
                  ].join(" ")}
                >
                  <CategoryZone
                    category={category}
                    tiles={categoryTiles}
                    isSolved={isSolved}
                    onRegister={onRegisterZone}
                    onTileDragEnd={onTileDragEnd}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Word pool */}
      <motion.div
        layout
        role="region"
        aria-label="Words to sort"
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
                <WordTile
                  tile={tile}
                  onDragEnd={onTileDragEnd}
                  onPickUp={pickUpTile}
                  isHeld={tile.id === heldTileId}
                  inKeyboardMode={!!heldTileId}
                  tileRef={(el) => {
                    if (el) tileRefs.current.set(tile.id, el);
                    else tileRefs.current.delete(tile.id);
                  }}
                />
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
