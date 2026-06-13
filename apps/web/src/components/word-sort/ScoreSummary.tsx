"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { formatTime } from "@/lib/daily-puzzle";
import { copyToClipboard } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

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
  const [copyFailed, setCopyFailed] = useState(false);
  const shouldReduce = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const openLogin = useAuthStore((s) => s.openLogin);

  async function handleShare() {
    if (!shareText) return;
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

  const statVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: shouldReduce ? 0 : 0.2 + i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduce ? {} : { opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.34, 1.2, 0.64, 1] }}
      className="w-full max-w-sm mx-auto mt-4 rounded-2xl border border-slate-200 bg-white shadow-md p-6 text-center"
    >
      <motion.p
        initial={shouldReduce ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.3, 0.64, 1] }}
        className="text-2xl font-bold text-emerald-600"
      >
        {title ? `${title} — solved!` : "Puzzle complete!"}
      </motion.p>

      <div className="mt-4 flex justify-center gap-8">
        {[
          { value: formatTime(elapsedMs), label: "Time" },
          { value: String(mistakes), label: "Mistakes" },
        ].map(({ value, label }, i) => (
          <motion.div key={label} custom={i} variants={statVariants} initial="hidden" animate="visible">
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
          </motion.div>
        ))}
      </div>

      {mistakes === 0 && (
        <motion.p
          initial={shouldReduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-3 text-sm text-emerald-600 font-medium"
        >
          Perfect — no mistakes!
        </motion.p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        {shareText && (
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
        )}
        {!user && (
          <button
            type="button"
            onClick={openLogin}
            className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
          >
            Save your score
          </button>
        )}
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
