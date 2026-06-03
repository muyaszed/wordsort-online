"use client";

import { useEffect, useState } from "react";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface GameHeaderProps {
  elapsedMs: number;
  moveCount: number;
  started: boolean;
  title: string;
}

export function GameHeader({
  elapsedMs,
  moveCount,
  started,
  title,
}: GameHeaderProps) {
  const [prevMoves, setPrevMoves] = useState(moveCount);
  const [moveAnim, setMoveAnim] = useState(false);

  useEffect(() => {
    if (moveCount !== prevMoves) {
      setMoveAnim(true);
      setPrevMoves(moveCount);
      const t = setTimeout(() => setMoveAnim(false), 350);
      return () => clearTimeout(t);
    }
  }, [moveCount, prevMoves]);

  return (
    <div className="flex items-center justify-between w-full max-w-sm">
      <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Time
        </span>
        <span className="text-lg font-mono font-semibold text-slate-700 tabular-nums">
          {started ? formatTime(elapsedMs) : "0:00"}
        </span>
      </div>

      <div className="text-center">
        <div className="text-sm font-semibold text-slate-500">{title}</div>
      </div>

      <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Steps
        </span>
        <span
          className={`text-lg font-mono font-semibold text-slate-700 tabular-nums transition-all ${
            moveAnim ? "text-indigo-600 scale-125" : ""
          }`}
        >
          {moveCount}
        </span>
      </div>
    </div>
  );
}
