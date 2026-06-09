"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const colors = colorMap[category.color];
  const emptySlots = Math.max(0, 4 - tiles.length);

  useEffect(() => {
    onRegister(category.id, ref.current);
    return () => onRegister(category.id, null);
  }, [category.id, onRegister]);

  return (
    <motion.div
      ref={ref}
      layout
      animate={isSolved ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={{ duration: 0.35 }}
      className={[
        "rounded-2xl border-2 p-4 min-h-[130px] flex flex-col gap-3",
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-auto text-emerald-600 font-bold"
          >
            ✓
          </motion.span>
        )}
      </div>

      {/* Tiles + empty slots */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tiles.map((tile) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <WordTile tile={tile} onDragEnd={onTileDragEnd} />
            </motion.div>
          ))}
        </AnimatePresence>

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`slot-${i}`}
            className="h-11 min-w-[4.5rem] rounded-xl border-2 border-dashed border-slate-200"
          />
        ))}
      </div>
    </motion.div>
  );
}
