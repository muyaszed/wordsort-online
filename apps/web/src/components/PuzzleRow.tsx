"use client";

import type { Tile } from "@wordsort/game-logic";
import { useCallback, useRef, useState } from "react";
import { PuzzleTile } from "./PuzzleTile";

interface PuzzleRowProps {
  row: Tile[];
  rowIndex: number;
  isSolved: boolean;
  onSlideLeft: (rowIndex: number) => void;
  onSlideRight: (rowIndex: number) => void;
  onColSlideStart?: (colIndex: number, clientY: number) => void;
}

export function PuzzleRow({
  row,
  rowIndex,
  isSolved,
  onSlideLeft,
  onSlideRight,
  onColSlideStart,
}: PuzzleRowProps) {
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const animLock = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartColRef = useRef<number | null>(null);

  const triggerSlide = useCallback(
    (dir: "left" | "right") => {
      if (animLock.current || isSolved) return;
      animLock.current = true;
      setAnimDir(dir);
      setTimeout(() => {
        dir === "left" ? onSlideLeft(rowIndex) : onSlideRight(rowIndex);
        setAnimDir(null);
        animLock.current = false;
      }, 200);
    },
    [isSolved, onSlideLeft, onSlideRight, rowIndex]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent, colIndex?: number) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartColRef.current = colIndex ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch || touchStartX.current === null || touchStartY.current === null) return;

      const dx = touch.clientX - touchStartX.current;
      const dy = touch.clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDy > absDx && absDy > 25 && touchStartColRef.current !== null) {
        onColSlideStart?.(touchStartColRef.current, dy < 0 ? -1 : 1);
        return;
      }

      if (absDx > absDy && absDx > 25) {
        triggerSlide(dx < 0 ? "left" : "right");
      }
    },
    [triggerSlide, onColSlideStart]
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => triggerSlide("left")}
        disabled={isSolved}
        aria-label={`Slide row ${rowIndex + 1} left`}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-none"
      >
        ◀
      </button>

      <div
        className={[
          "flex gap-2",
          animDir === "left" ? "animate-slide-left" : "",
          animDir === "right" ? "animate-slide-right" : "",
        ].join(" ")}
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchEnd={handleTouchEnd}
      >
        {row.map((tile, colIndex) => (
          <div
            key={tile.id}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleTouchStart(e, colIndex);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleTouchEnd(e);
            }}
          >
            <PuzzleTile tile={tile} isSolved={isSolved} />
          </div>
        ))}
      </div>

      <button
        onClick={() => triggerSlide("right")}
        disabled={isSolved}
        aria-label={`Slide row ${rowIndex + 1} right`}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-none"
      >
        ▶
      </button>
    </div>
  );
}
