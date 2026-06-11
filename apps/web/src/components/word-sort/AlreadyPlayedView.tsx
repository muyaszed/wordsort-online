"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";
import { formatTime } from "@/lib/daily-puzzle";
import { copyToClipboard } from "@/lib/utils";

interface AlreadyPlayedViewProps {
  puzzleId: string;
  title?: string;
  elapsedMs: number;
  mistakes: number;
  shareText: string;
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
  const [copyFailed, setCopyFailed] = useState(false);

  const dateLabel = new Date(puzzleId + "T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }
  );

  async function handleShare() {
    const ok = await copyToClipboard(shareText);
    if (ok) {
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 4000);
    }
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
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors text-white ${
            copyFailed
              ? "bg-red-500 hover:bg-red-600"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {copied ? "Copied!" : copyFailed ? "Copy failed — try again" : "Share score"}
        </button>
      </div>
    </motion.div>
  );
}
