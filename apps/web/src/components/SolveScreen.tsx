"use client";

import { useState } from "react";
import { submitScore } from "@/lib/api-client";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;
}

interface SolveScreenProps {
  elapsedMs: number;
  moveCount: number;
  puzzleTitle: string;
  onReset: () => void;
}

export function SolveScreen({
  elapsedMs,
  moveCount,
  puzzleTitle,
  onReset,
}: SolveScreenProps) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    await submitScore({
      name: name.trim().slice(0, 20),
      steps: moveCount,
      timeSeconds: Math.floor(elapsedMs / 1000),
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  const stars =
    moveCount <= 15 ? 3 : moveCount <= 30 ? 2 : 1;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-bounce-in">
        <div className="text-5xl mb-3">
          {stars === 3 ? "🏆" : stars === 2 ? "🎉" : "✅"}
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Puzzle Solved!
        </h2>
        <p className="text-sm text-slate-500 mb-6">{puzzleTitle}</p>

        <div className="flex justify-center gap-8 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-indigo-600 font-mono">
              {formatTime(elapsedMs)}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              Time
            </span>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-indigo-600 font-mono">
              {moveCount}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              Steps
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-2xl ${i < stars ? "opacity-100" : "opacity-20"}`}
            >
              ⭐
            </span>
          ))}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mb-4">
            <p className="text-sm text-slate-600 mb-3 font-medium">
              Submit your score to the leaderboard
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={20}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
              />
              <button
                type="submit"
                disabled={!name.trim() || submitting}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "…" : "Go"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-4 py-3 px-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
            Score submitted! 🎊
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
