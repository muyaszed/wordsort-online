"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PanInfo, TargetAndTransition } from "framer-motion";
import type { WordTileData } from "@/lib/word-sort-types";

interface WordTileProps {
  tile: WordTileData;
  onDragEnd?: (tileId: string, x: number, y: number) => void;
  onPickUp?: (tileId: string) => void;
  isHeld?: boolean;
  inKeyboardMode?: boolean;
  tileRef?: React.RefCallback<HTMLElement>;
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

export function WordTile({
  tile,
  onDragEnd,
  onPickUp,
  isHeld,
  inKeyboardMode,
  tileRef,
}: WordTileProps) {
  const shouldReduce = useReducedMotion();
  const isDraggable = tile.state !== "revealed";
  const isKeyboardInteractive = !!onPickUp && isDraggable;

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    onDragEnd?.(tile.id, info.point.x, info.point.y);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isKeyboardInteractive) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onPickUp!(tile.id);
    }
  }

  const animateState: TargetAndTransition = shouldReduce
    ? { x: 0, scale: 1 }
    : tile.state === "incorrect"
    ? {
        x: [0, -9, 9, -7, 7, -4, 4, 0],
        transition: { duration: 0.45, ease: "easeInOut" as const },
      }
    : tile.state === "correct"
    ? {
        x: 0,
        scale: [1, 1.2, 0.93, 1.07, 1],
        transition: { duration: 0.45, times: [0, 0.25, 0.55, 0.78, 1] },
      }
    : { x: 0, scale: 1 };

  const sharedClassName = [
    "flex items-center justify-center rounded-xl font-semibold text-sm",
    "border-2 shadow-sm select-none",
    "h-11 px-4 min-w-[4.5rem]",
    "transition-colors duration-200",
    stateClasses[tile.state],
    isHeld ? "ring-2 ring-indigo-500 ring-offset-2" : "",
  ].join(" ");

  const sharedMotionProps = {
    layout: true as const,
    drag: isDraggable as boolean,
    dragMomentum: false,
    dragElastic: 0.12,
    whileDrag: shouldReduce
      ? {}
      : {
          scale: 1.12,
          zIndex: 50,
          boxShadow: "0 18px 36px rgba(0,0,0,0.25)",
          cursor: "grabbing",
        },
    animate: animateState,
    onDragEnd: handleDragEnd,
    onKeyDown: handleKeyDown,
    "aria-label": isHeld ? `${tile.word}, selected` : tile.word,
    className: sharedClassName,
  };

  // Pool tiles: use a native <button> so Tab navigation works on all
  // platforms including macOS (where div[tabIndex] is skipped by default).
  if (isKeyboardInteractive) {
    return (
      <motion.button
        ref={tileRef as React.RefCallback<HTMLButtonElement>}
        {...sharedMotionProps}
        type="button"
        tabIndex={inKeyboardMode ? -1 : 0}
        aria-pressed={isHeld ?? false}
      >
        {tile.word}
      </motion.button>
    );
  }

  return (
    <motion.div ref={tileRef as React.RefCallback<HTMLDivElement>} {...sharedMotionProps} tabIndex={-1}>
      {tile.word}
    </motion.div>
  );
}
