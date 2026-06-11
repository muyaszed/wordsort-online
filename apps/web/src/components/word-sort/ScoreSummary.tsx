"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/daily-puzzle";

interface ScoreSummaryProps {
  title?: string;
  elapsedMs: number;
  mistakes: number;
  shareText?: string;
  onPlayAgain: () => void;
}

export function ScoreSummary({
  title,
  elapsedMs,
  mistakes,
  shareText,
  onPlayAgain,
}: ScoreSummaryProps) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    if (!shareText) return;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-sm mx-auto mt-4 rounded-2xl border border-slate-200 bg-white shadow-md p-6 text-center"
    >
      <p className="text-2xl font-bold text-emerald-600">
        {title ? `${title} — solved!` : "Puzzle complete!"}
      </p>

      <div className="mt-4 flex justify-center gap-8">
        <div>
          <p className="text-3xl font-bold text-slate-800">{formatTime(elapsedMs)}</p>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">Time</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800">{mistakes}</p>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">Mistakes</p>
        </div>
      </div>

      {mistakes === 0 && (
        <p className="mt-3 text-sm text-emerald-600 font-medium">Perfect — no mistakes!</p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        {shareText && (
          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            {copied ? "Copied!" : "Share score"}
          </button>
        )}
        <a
          href="/sign-in"
          className="block w-full py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
        >
          Save your score
        </a>
        <button
          onClick={onPlayAgain}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
        >
          Play again
        </button>
      </div>
    </motion.div>
  );
}
