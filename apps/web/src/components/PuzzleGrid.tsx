"use client";

import type { Grid } from "@wordsort/game-logic";
import { useCallback, useRef, useState } from "react";
import { PuzzleRow } from "./PuzzleRow";

const TILE_SIZE = 64; // w-14 (56px) + gap-2 (8px)

interface PuzzleGridProps {
  grid: Grid;
  targetWords: string[];
  onSlideRowLeft: (rowIndex: number) => void;
  onSlideRowRight: (rowIndex: number) => void;
  onSlideColUp: (colIndex: number) => void;
  onSlideColDown: (colIndex: number) => void;
}

function ColButton({
  dir,
  colIndex,
  onClick,
  disabled,
}: {
  dir: "up" | "down";
  colIndex: number;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Slide column ${colIndex + 1} ${dir}`}
      className="w-14 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
    >
      {dir === "up" ? "▲" : "▼"}
    </button>
  );
}

export function PuzzleGrid({
  grid,
  targetWords,
  onSlideRowLeft,
  onSlideRowRight,
  onSlideColUp,
  onSlideColDown,
}: PuzzleGridProps) {
  const [colAnimDir, setColAnimDir] = useState<Record<number, "up" | "down">>(
    {}
  );
  const colAnimLock = useRef<Record<number, boolean>>({});

  const maxCols = Math.max(...grid.map((r) => r.length));
  const numCols5 = grid.filter((r) => r.length >= 5).length > 0 ? maxCols : 4;

  const rowWordMatch = (rowIndex: number): boolean => {
    const row = grid[rowIndex];
    const target = targetWords[rowIndex];
    if (!row || !target) return false;
    return row.map((t) => t.letter).join("") === target;
  };

  const triggerColSlide = useCallback(
    (colIndex: number, dir: "up" | "down") => {
      if (colAnimLock.current[colIndex]) return;
      colAnimLock.current[colIndex] = true;
      setColAnimDir((prev) => ({ ...prev, [colIndex]: dir }));
      setTimeout(() => {
        dir === "up" ? onSlideColUp(colIndex) : onSlideColDown(colIndex);
        setColAnimDir((prev) => {
          const next = { ...prev };
          delete next[colIndex];
          return next;
        });
        colAnimLock.current[colIndex] = false;
      }, 200);
    },
    [onSlideColUp, onSlideColDown]
  );

  const handleColSwipe = useCallback(
    (colIndex: number, dy: number) => {
      triggerColSlide(colIndex, dy < 0 ? "up" : "down");
    },
    [triggerColSlide]
  );

  const allSolved = targetWords.every((_, i) => rowWordMatch(i));

  return (
    <div className="flex flex-col gap-2 items-center select-none">
      {/* Column up buttons */}
      <div className="flex gap-2 ml-[40px]">
        {Array.from({ length: numCols5 }).map((_, ci) => (
          <ColButton
            key={ci}
            dir="up"
            colIndex={ci}
            onClick={() => triggerColSlide(ci, "up")}
            disabled={allSolved}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {grid.map((row, rowIndex) => {
          const solved = rowWordMatch(rowIndex);
          return (
            <div
              key={rowIndex}
              className={[
                "relative flex",
                colAnimDir[0] !== undefined ||
                Object.keys(colAnimDir).length > 0
                  ? ""
                  : "",
              ].join(" ")}
            >
              <PuzzleRow
                row={row}
                rowIndex={rowIndex}
                isSolved={solved}
                onSlideLeft={onSlideRowLeft}
                onSlideRight={onSlideRowRight}
                onColSlideStart={handleColSwipe}
              />
            </div>
          );
        })}
      </div>

      {/* Column down buttons */}
      <div className="flex gap-2 ml-[40px]">
        {Array.from({ length: numCols5 }).map((_, ci) => (
          <ColButton
            key={ci}
            dir="down"
            colIndex={ci}
            onClick={() => triggerColSlide(ci, "down")}
            disabled={allSolved}
          />
        ))}
      </div>

      {/* Word targets hint */}
      <div className="mt-2 flex flex-col items-start gap-1 w-full max-w-xs">
        {targetWords.map((word, i) => {
          const solved = rowWordMatch(i);
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${solved ? "bg-emerald-500" : "bg-slate-300"}`}
              />
              <span
                className={`text-xs font-mono tracking-widest ${solved ? "text-emerald-600 line-through" : "text-slate-400"}`}
              >
                {word}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
