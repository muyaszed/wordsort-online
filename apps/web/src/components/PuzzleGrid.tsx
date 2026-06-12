"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { canSlide, findEmpty, getSolvedCells, getSolvedWordSet, type PuzzleGrid, type PuzzleState } from "@/lib/puzzle-engine";

interface PuzzleGridProps {
  state: PuzzleState;
  onSlideTile: (index: number) => void;
}

const CELL = 64; // px per cell (tile 56 + gap 8)
const TILE = 56; // tile size

export function PuzzleGrid({ state, onSlideTile }: PuzzleGridProps) {
  const { grid, targetWords } = state;
  const [animating, setAnimating] = useState<{ index: number; dx: number; dy: number } | null>(null);
  const lockRef = useRef(false);

  const emptyIndex = findEmpty(grid);
  const emptyRow = Math.floor(emptyIndex / 5);
  const emptyCol = emptyIndex % 5;

  const solvedCells = useMemo(() => getSolvedCells(state), [state.grid]);
  const solvedWords = useMemo(() => getSolvedWordSet(state), [state.grid]);

  const handleClick = useCallback(
    (index: number) => {
      if (lockRef.current) return;
      if (!canSlide(grid, index)) return;
      lockRef.current = true;

      const tileRow = Math.floor(index / 5);
      const tileCol = index % 5;
      const dx = (emptyCol - tileCol) * CELL;
      const dy = (emptyRow - tileRow) * CELL;

      setAnimating({ index, dx, dy });
      setTimeout(() => {
        onSlideTile(index);
        setAnimating(null);
        lockRef.current = false;
      }, 180);
    },
    [grid, emptyRow, emptyCol, onSlideTile]
  );

  // Touch swipe
  const touchStart = useRef<{ x: number; y: number; index: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    const t = e.touches[0];
    if (t) touchStart.current = { x: t.clientX, y: t.clientY, index };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t || !touchStart.current) return;
      const dy = t.clientY - touchStart.current.y;
      const dx = t.clientX - touchStart.current.x;
      const { index } = touchStart.current;
      touchStart.current = null;

      if (Math.abs(dy) < 20 && Math.abs(dx) < 20) return;

      const tileRow = Math.floor(index / 5);
      const tileCol = index % 5;
      const emptyIdx = findEmpty(grid);
      const eRow = Math.floor(emptyIdx / 5);
      const eCol = emptyIdx % 5;

      // Allow swipe only if the swipe direction matches the tile's position relative to empty
      const isAbove = tileRow < eRow && tileCol === eCol && dy > 0;
      const isBelow = tileRow > eRow && tileCol === eCol && dy < 0;
      const isLeft = tileCol < eCol && tileRow === eRow && dx > 0;
      const isRight = tileCol > eCol && tileRow === eRow && dx < 0;

      if (isAbove || isBelow || isLeft || isRight) {
        handleClick(index);
      }
    },
    [grid, handleClick]
  );

  return (
    <div className="flex flex-col items-center gap-5 select-none">
      {/* 5×5 grid */}
      <div
        className="relative"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(5, ${TILE}px)`,
          gap: 8,
        }}
      >
        {grid.map((cell, index) => {
          const slideable = canSlide(grid, index);
          const isCellSolved = solvedCells.has(index);
          const isAnim = animating?.index === index;

          if (cell === null) {
            return (
              <div
                key={index}
                style={{ width: TILE, height: TILE }}
                className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50"
              />
            );
          }

          return (
            <div
              key={index}
              onClick={() => handleClick(index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchEnd={handleTouchEnd}
              style={{
                width: TILE,
                height: TILE,
                transform: isAnim ? `translate(${animating.dx}px, ${animating.dy}px)` : undefined,
                transition: isAnim ? "transform 170ms ease-in-out" : undefined,
                zIndex: isAnim ? 10 : undefined,
              }}
              className={[
                "flex items-center justify-center rounded-xl text-xl font-bold",
                "border-2 shadow-sm",
                slideable && !state.solved
                  ? "cursor-pointer hover:border-indigo-400 hover:shadow-md active:scale-95"
                  : "cursor-default",
                isCellSolved
                  ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-800",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {cell}
            </div>
          );
        })}
      </div>

      {/* Target words */}
      <div className="flex flex-col items-start gap-1.5 w-full" style={{ maxWidth: 5 * TILE + 4 * 8 }}>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
          Target words
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {targetWords.map((word, i) => {
            const solved = solvedWords.has(word);
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

      {!state.solved && (
        <p className="text-xs text-slate-400 text-center max-w-xs">
          Slide tiles into the empty space to spell the target words.
        </p>
      )}
    </div>
  );
}
