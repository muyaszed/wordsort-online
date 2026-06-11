"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { useGameStore } from "@/store/game-store";
import { getYesterdayPuzzleId } from "@/lib/daily-puzzle";

interface DailyPuzzleHeaderProps {
  puzzleId: string;
  title?: string;
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export function DailyPuzzleHeader({ puzzleId, title }: DailyPuzzleHeaderProps) {
  const countdown = useCountdown();
  const completedPuzzles = useGameStore((s) => s.completedPuzzles);
  const yesterdayResult = completedPuzzles[getYesterdayPuzzleId()] ?? null;

  const dateLabel = new Date(puzzleId + "T00:00:00Z").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }
  );

  return (
    <div className="text-center space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        WordSort
      </h1>
      <p className="text-sm font-medium text-slate-600">
        {title ? `${title} · ` : ""}{dateLabel}
      </p>
      <p className="text-xs text-slate-400">
        Next puzzle in{" "}
        <span className="font-mono font-semibold text-slate-600">
          {countdown}
        </span>
      </p>
      {yesterdayResult && (
        <p className="text-xs text-slate-400">
          Yesterday:{" "}
          <span className="text-slate-600 font-medium">
            {formatElapsed(yesterdayResult.elapsedMs)}
          </span>
          {yesterdayResult.mistakes === 0 ? (
            <span className="text-emerald-500 ml-1">· perfect</span>
          ) : (
            <span className="ml-1">
              · {yesterdayResult.mistakes} mistake
              {yesterdayResult.mistakes !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
