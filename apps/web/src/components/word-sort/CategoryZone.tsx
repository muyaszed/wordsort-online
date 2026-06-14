"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CategoryDef, WordTileData, ZoneColor } from "@/lib/word-sort-types";
import { WordTile } from "./WordTile";

interface CategoryZoneProps {
  category: CategoryDef;
  tiles: WordTileData[];
  isSolved: boolean;
  onRegister: (categoryId: string, el: HTMLElement | null) => void;
  onTileDragEnd?: (tileId: string, x: number, y: number) => void;
}

const colorMap: Record<ZoneColor, { border: string; bg: string; solvedBg: string; label: string; dot: string }> = {
  yellow: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    solvedBg: "bg-amber-100 border-amber-400",
    label: "text-amber-800",
    dot: "bg-amber-400",
  },
  green: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    solvedBg: "bg-emerald-100 border-emerald-400",
    label: "text-emerald-800",
    dot: "bg-emerald-400",
  },
  blue: {
    border: "border-blue-300",
    bg: "bg-blue-50",
    solvedBg: "bg-blue-100 border-blue-400",
    label: "text-blue-800",
    dot: "bg-blue-400",
  },
  purple: {
    border: "border-purple-300",
    bg: "bg-purple-50",
    solvedBg: "bg-purple-100 border-purple-400",
    label: "text-purple-800",
    dot: "bg-purple-400",
  },
};

export function CategoryZone({
  category,
  tiles,
  isSolved,
  onRegister,
  onTileDragEnd,
}: CategoryZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();
  const colors = colorMap[category.color];
  const emptySlots = Math.max(0, 4 - tiles.length);

  useEffect(() => {
    onRegister(category.id, ref.current);
    return () => onRegister(category.id, null);
  }, [category.id, onRegister]);

  const solvedAnimate = shouldReduce
    ? { scale: 1, y: 0 }
    : { scale: [1, 1.06, 0.97, 1.02, 1], y: [0, -6, -3, -1.5, 0] };

  return (
    <motion.div
      ref={ref}
      layout
      animate={isSolved ? solvedAnimate : { scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={[
        "rounded-2xl border-2 p-3 sm:p-4 min-h-[110px] sm:min-h-[130px] flex flex-col gap-2 sm:gap-3",
        "transition-colors duration-300",
        isSolved
          ? colors.solvedBg
          : [colors.border, colors.bg].join(" "),
      ].join(" ")}
    >
      {/* Label */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${colors.label}`}
        >
          {category.name}
        </span>
        {isSolved && (
          <motion.span
            initial={shouldReduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.15 }}
            className="ml-auto text-emerald-600 font-bold"
          >
            ✓
          </motion.span>
        )}
      </div>

      {/* Tiles + empty slots */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.id}
              initial={shouldReduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduce ? {} : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: isSolved ? i * 0.05 : 0 }}
            >
              <WordTile tile={tile} onDragEnd={onTileDragEnd} />
            </motion.div>
          ))}
        </AnimatePresence>

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`slot-${i}`}
            className="h-12 min-w-[4rem] sm:min-w-[4.5rem] rounded-xl border-2 border-dashed border-slate-200"
          />
        ))}
      </div>
    </motion.div>
  );
}
