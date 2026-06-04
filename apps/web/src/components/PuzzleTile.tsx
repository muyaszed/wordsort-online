"use client";

import type { Tile } from "@wordsort/game-logic";

interface PuzzleTileProps {
  tile: Tile;
  isSolved: boolean;
  animClass?: string;
}

export function PuzzleTile({ tile, isSolved, animClass }: PuzzleTileProps) {
  return (
    <div
      key={tile.id}
      className={[
        "w-14 h-14 flex items-center justify-center",
        "rounded-xl text-xl font-bold select-none",
        "border-2 shadow-sm transition-colors duration-300",
        isSolved
          ? "bg-emerald-100 border-emerald-400 text-emerald-800"
          : "bg-white border-slate-200 text-slate-800",
        animClass ?? "",
      ].join(" ")}
    >
      {tile.letter}
    </div>
  );
}
