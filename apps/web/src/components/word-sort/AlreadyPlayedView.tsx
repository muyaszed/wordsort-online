"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";

interface AlreadyPlayedViewProps {
  puzzleId: string;
  title?: string;
  elapsedMs: number;
  mistakes: number;
  shareText: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function AlreadyPlayedView({
  puzzleId,
  title,
  elapsedMs,
  mistakes,
  shareText,
}: AlreadyPlayedViewProps) {
  const countdown = useCountdown();
  const [copied, setCopied] = useState(false);

  const dateLabel = new Date(puzzleId + "T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }
  );

  function handleShare() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto rounded-2xl border border-slate-200 bg-white shadow-md p-6 text-center"
    >
      <p className="text-lg font-bold text-slate-800">
        {title ? `${title} — done!` : "Already played today!"}
      </p>
      <p className="text-sm text-slate-400 mt-0.5">{dateLabel}</p>

      <div className="mt-4 flex justify-center gap-8">
        <div>
          <p className="text-3xl font-bold text-slate-800">
            {formatTime(elapsedMs)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">
            Time
          </p>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800">{mistakes}</p>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">
            Mistakes
          </p>
        </div>
      </div>

      {mistakes === 0 && (
        <p className="mt-3 text-sm text-emerald-600 font-medium">
          Perfect — no mistakes!
        </p>
      )}

      <div className="mt-5 space-y-2">
        <p className="text-xs text-slate-400">
          Next puzzle in{" "}
          <span className="font-mono font-semibold text-slate-600">
            {countdown}
          </span>
        </p>
        <button
          onClick={handleShare}
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          {copied ? "Copied!" : "Share score"}
        </button>
      </div>
    </motion.div>
  );
}
