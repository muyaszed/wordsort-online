"use client";

import type { Grid } from "@wordsort/game-logic";
import { useCallback, useRef, useState } from "react";

interface PuzzleGridProps {
  grid: Grid;
  targetWords: string[];
  onSlideColUp: (colIndex: number) => void;
  onSlideColDown: (colIndex: number) => void;
}

const TILE_W = 56; // w-14

function rowSolvedClass(solved: boolean) {
  return solved
    ? "bg-emerald-50 border-emerald-200 rounded-xl px-1"
    : "px-1";
}

export function PuzzleGrid({
  grid,
  targetWords,
  onSlideColUp,
  onSlideColDown,
}: PuzzleGridProps) {
  // selected: { row, col } — the tile the player tapped first
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  // animating column → direction
  const [colAnim, setColAnim] = useState<Record<number, "up" | "down">>({});
  const animLock = useRef<Record<number, boolean>>({});

  const maxCols = Math.max(...grid.map((r) => r.length));

  const isRowSolved = useCallback(
    (rowIndex: number) => {
      const row = grid[rowIndex];
      const target = targetWords[rowIndex];
      if (!row || !target) return false;
      return row.map((t) => t.letter).join("") === target;
    },
    [grid, targetWords]
  );

  const triggerCol = useCallback(
    (colIndex: number, dir: "up" | "down") => {
      if (animLock.current[colIndex]) return;
      animLock.current[colIndex] = true;
      setColAnim((prev) => ({ ...prev, [colIndex]: dir }));
      setTimeout(() => {
        dir === "up" ? onSlideColUp(colIndex) : onSlideColDown(colIndex);
        setColAnim((prev) => {
          const next = { ...prev };
          delete next[colIndex];
          return next;
        });
        animLock.current[colIndex] = false;
      }, 180);
    },
    [onSlideColUp, onSlideColDown]
  );

  const handleTileClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (isRowSolved(rowIndex)) return;

      if (!selected) {
        setSelected({ row: rowIndex, col: colIndex });
        return;
      }

      // Deselect if same tile clicked again
      if (selected.row === rowIndex && selected.col === colIndex) {
        setSelected(null);
        return;
      }

      // If same column: cycle toward the tapped row
      if (selected.col === colIndex) {
        const colRows = grid
          .map((r, i) => (colIndex < r.length ? i : -1))
          .filter((i) => i >= 0);
        const fromPos = colRows.indexOf(selected.row);
        const toPos = colRows.indexOf(rowIndex);
        if (fromPos !== -1 && toPos !== -1) {
          const n = colRows.length;
          const stepsUp = ((fromPos - toPos) + n) % n;
          const stepsDown = ((toPos - fromPos) + n) % n;
          const dir = stepsUp <= stepsDown ? "up" : "down";
          const steps = Math.min(stepsUp, stepsDown);
          let i = 0;
          const fire = () => {
            if (i >= steps) return;
            triggerCol(colIndex, dir);
            i++;
            setTimeout(fire, 220);
          };
          fire();
        }
        setSelected(null);
        return;
      }

      // Different column: just change selection
      setSelected({ row: rowIndex, col: colIndex });
    },
    [selected, grid, triggerCol, isRowSolved]
  );

  // Touch swipe tracking per tile
  const touchStart = useRef<{ x: number; y: number; col: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent, colIndex: number) => {
    const t = e.touches[0];
    if (t) touchStart.current = { x: t.clientX, y: t.clientY, col: colIndex };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t || !touchStart.current) return;
      const dy = t.clientY - touchStart.current.y;
      const dx = t.clientX - touchStart.current.x;
      const col = touchStart.current.col;
      touchStart.current = null;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 20) {
        triggerCol(col, dy < 0 ? "up" : "down");
        setSelected(null);
      }
    },
    [triggerCol]
  );

  const allSolved = targetWords.every((_, i) => isRowSolved(i));

  return (
    <div className="flex flex-col items-center gap-0 select-none">
      {/* Column up buttons */}
      <div className="flex gap-2 mb-1" style={{ paddingLeft: 0 }}>
        {Array.from({ length: maxCols }).map((_, ci) => (
          <button
            key={ci}
            onClick={() => triggerCol(ci, "up")}
            disabled={allSolved}
            aria-label={`Slide column ${ci + 1} up`}
            className="flex items-center justify-center rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            style={{ width: TILE_W, height: 28 }}
          >
            ▲
          </button>
        ))}
      </div>

      {/* Grid rows */}
      <div className="flex flex-col gap-2">
        {grid.map((row, rowIndex) => {
          const solved = isRowSolved(rowIndex);
          return (
            <div
              key={rowIndex}
              className={`flex gap-2 transition-colors duration-300 ${rowSolvedClass(solved)}`}
            >
              {row.map((tile, colIndex) => {
                const isSelected =
                  selected?.row === rowIndex && selected?.col === colIndex;
                const colMoving = colAnim[colIndex];

                return (
                  <div
                    key={tile.id}
                    onClick={() => handleTileClick(rowIndex, colIndex)}
                    onTouchStart={(e) => handleTouchStart(e, colIndex)}
                    onTouchEnd={handleTouchEnd}
                    className={[
                      "flex items-center justify-center rounded-xl text-xl font-bold cursor-pointer",
                      "border-2 shadow-sm transition-all duration-150 active:scale-95",
                      isSelected
                        ? "bg-indigo-100 border-indigo-500 text-indigo-900 scale-105 shadow-md z-10"
                        : solved
                        ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                        : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:shadow",
                      colMoving === "up"
                        ? "animate-slide-up"
                        : colMoving === "down"
                        ? "animate-slide-down"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ width: TILE_W, height: TILE_W }}
                  >
                    {tile.letter}
                  </div>
                );
              })}
              {/* Pad shorter rows so column buttons stay aligned */}
              {row.length < maxCols &&
                Array.from({ length: maxCols - row.length }).map((_, i) => (
                  <div
                    key={`pad-${i}`}
                    style={{ width: TILE_W, height: TILE_W }}
                  />
                ))}
            </div>
          );
        })}
      </div>

      {/* Column down buttons */}
      <div className="flex gap-2 mt-1">
        {Array.from({ length: maxCols }).map((_, ci) => (
          <button
            key={ci}
            onClick={() => triggerCol(ci, "down")}
            disabled={allSolved}
            aria-label={`Slide column ${ci + 1} down`}
            className="flex items-center justify-center rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            style={{ width: TILE_W, height: 28 }}
          >
            ▼
          </button>
        ))}
      </div>

      {/* Target words hint */}
      <div className="mt-4 flex flex-col items-start gap-1.5 w-full" style={{ maxWidth: maxCols * TILE_W + (maxCols - 1) * 8 }}>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">
          Target words
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {targetWords.map((word, i) => {
            const solved = isRowSolved(i);
            return (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    solved ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                <span
                  className={`text-xs font-mono tracking-widest ${
                    solved
                      ? "text-emerald-600 line-through decoration-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {word}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      {!allSolved && (
        <p className="mt-3 text-xs text-slate-400 text-center max-w-xs">
          Tap a tile to select it, then tap another in the same column to move it there.
          Or swipe up/down on any column.
        </p>
      )}
    </div>
  );
}
