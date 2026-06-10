"use client";

import { motion } from "framer-motion";
import type { PanInfo } from "framer-motion";
import type { WordTileData } from "@/lib/word-sort-types";

interface WordTileProps {
  tile: WordTileData;
  onDragEnd?: (tileId: string, x: number, y: number) => void;
}

const stateClasses: Record<WordTileData["state"], string> = {
  idle: "bg-white border-slate-200 text-slate-800 cursor-grab hover:border-indigo-300 hover:shadow-md",
  dragging:
    "bg-slate-50 border-indigo-400 text-slate-800 cursor-grabbing shadow-xl",
  correct:
    "bg-emerald-50 border-emerald-400 text-emerald-800 cursor-grab hover:border-emerald-500",
  incorrect: "bg-red-50 border-red-400 text-red-800 cursor-grab",
  revealed:
    "bg-emerald-100 border-emerald-500 text-emerald-900 cursor-default",
};

export function WordTile({ tile, onDragEnd }: WordTileProps) {
  const isDraggable = tile.state !== "revealed";

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    onDragEnd?.(tile.id, info.point.x, info.point.y);
  }

  return (
    <motion.div
      layout
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0.12}
      whileDrag={{
        scale: 1.1,
        zIndex: 50,
        boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
        cursor: "grabbing",
      }}
      animate={
        tile.state === "incorrect"
          ? { x: [0, -7, 7, -7, 7, 0], transition: { duration: 0.4 } }
          : tile.state === "correct"
          ? { scale: [1, 1.12, 1], transition: { duration: 0.28 } }
          : { x: 0, scale: 1 }
      }
      onDragEnd={handleDragEnd}
      className={[
        "flex items-center justify-center rounded-xl font-semibold text-sm",
        "border-2 shadow-sm select-none",
        "h-11 px-4 min-w-[4.5rem]",
        "transition-colors duration-200",
        stateClasses[tile.state],
      ].join(" ")}
    >
      {tile.word}
    </motion.div>
  );
}
