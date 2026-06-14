"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, Footprints, RefreshCw } from "lucide-react";
import { leaderboardApi, type LeaderboardEntry } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

type Tab = "daily" | "alltime";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="tabular-nums text-sm font-medium text-slate-400 w-6 text-center">
      {rank}
    </span>
  );
}

function LeaderboardTable({
  entries,
  currentUsername,
}: {
  entries: LeaderboardEntry[];
  currentUsername: string | null;
}) {
  if (entries.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        No scores yet. Be the first to complete today&apos;s puzzle!
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="py-3 pl-4 pr-2 text-left font-medium text-slate-500 w-12">
              #
            </th>
            <th className="py-3 px-2 text-left font-medium text-slate-500">
              Player
            </th>
            <th className="py-3 px-2 text-right font-medium text-slate-500">
              <span className="flex items-center justify-end gap-1">
                <Footprints size={13} />
                Steps
              </span>
            </th>
            <th className="py-3 pl-2 pr-4 text-right font-medium text-slate-500">
              <span className="flex items-center justify-end gap-1">
                <Clock size={13} />
                Time
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const displayName = entry.name.trim() || "Anonymous";
            const isCurrentUser =
              currentUsername !== null && displayName === currentUsername;

            return (
              <tr
                key={entry.id}
                className={[
                  "border-b border-slate-100 last:border-0 transition-colors",
                  isCurrentUser
                    ? "bg-indigo-50 font-semibold"
                    : "hover:bg-slate-50",
                ].join(" ")}
              >
                <td className="py-3 pl-4 pr-2">
                  <RankBadge rank={idx + 1} />
                </td>
                <td className="py-3 px-2">
                  <span
                    className={
                      isCurrentUser ? "text-indigo-700" : "text-slate-800"
                    }
                  >
                    {displayName}
                    {isCurrentUser && (
                      <span className="ml-1.5 text-xs text-indigo-400 font-normal">
                        (you)
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-3 px-2 text-right tabular-nums text-slate-700">
                  {entry.steps}
                </td>
                <td className="py-3 pl-2 pr-4 text-right tabular-nums text-slate-700">
                  {formatTime(entry.timeSeconds)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const user = useAuthStore((s) => s.user);
  const currentUsername = user?.username ?? null;

  const {
    data: dailyData,
    isLoading: dailyLoading,
    error: dailyError,
    refetch: refetchDaily,
    dataUpdatedAt: dailyUpdatedAt,
  } = useQuery({
    queryKey: ["leaderboard", "daily"],
    queryFn: () => leaderboardApi.daily(),
    refetchInterval: 60_000,
    refetchOnMount: true,
  });

  const {
    data: alltimeData,
    isLoading: alltimeLoading,
    error: alltimeError,
    refetch: refetchAlltime,
    dataUpdatedAt: alltimeUpdatedAt,
  } = useQuery({
    queryKey: ["leaderboard", "alltime"],
    queryFn: () => leaderboardApi.alltime(),
    refetchInterval: 60_000,
    refetchOnMount: true,
  });

  const handleRefresh = useCallback(() => {
    if (tab === "daily") refetchDaily();
    else refetchAlltime();
  }, [tab, refetchDaily, refetchAlltime]);

  const isLoading = tab === "daily" ? dailyLoading : alltimeLoading;
  const error = tab === "daily" ? dailyError : alltimeError;
  const entries =
    tab === "daily"
      ? (dailyData?.data ?? [])
      : (alltimeData?.data ?? []);
  const updatedAt = tab === "daily" ? dailyUpdatedAt : alltimeUpdatedAt;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  const secondsAgo = updatedAt ? Math.floor((now - updatedAt) / 1000) : null;
  const freshLabel =
    secondsAgo === null
      ? ""
      : secondsAgo < 5
        ? "just now"
        : secondsAgo < 60
          ? `${secondsAgo}s ago`
          : `${Math.floor(secondsAgo / 60)}m ago`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Trophy size={24} className="text-indigo-500" />
        <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
      </div>

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {(["daily", "alltime"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {t === "daily" ? "Today" : "All-time"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          {freshLabel && <span>Updated {freshLabel}</span>}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh leaderboard"
            className="rounded p-1 hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
          Failed to load leaderboard. Please try again.
        </div>
      ) : isLoading && entries.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
            >
              <div className="h-4 w-6 animate-pulse rounded bg-slate-100" />
              <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : (
        <LeaderboardTable entries={entries} currentUsername={currentUsername} />
      )}

      {entries.length > 0 && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Showing top {entries.length} scores · refreshes every 60s
        </p>
      )}
    </div>
  );
}
