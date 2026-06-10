import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompletedPuzzle {
  puzzleId: string;
  elapsedMs: number;
  mistakes: number;
  completedAt: string;
}

interface GameStore {
  activePuzzleId: string | null;
  completedPuzzles: Record<string, CompletedPuzzle>;
  setActivePuzzle: (puzzleId: string) => void;
  markPuzzleCompleted: (puzzleId: string, elapsedMs: number, mistakes: number) => void;
  isPuzzleCompleted: (puzzleId: string) => boolean;
  getBestTime: (puzzleId: string) => number | null;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      activePuzzleId: null,
      completedPuzzles: {},

      setActivePuzzle: (puzzleId) => set({ activePuzzleId: puzzleId }),

      markPuzzleCompleted: (puzzleId, elapsedMs, mistakes) =>
        set((state) => ({
          completedPuzzles: {
            ...state.completedPuzzles,
            [puzzleId]: {
              puzzleId,
              elapsedMs,
              mistakes,
              completedAt: new Date().toISOString(),
            },
          },
        })),

      isPuzzleCompleted: (puzzleId) =>
        puzzleId in get().completedPuzzles,

      getBestTime: (puzzleId) =>
        get().completedPuzzles[puzzleId]?.elapsedMs ?? null,
    }),
    {
      name: "wordsort-game",
      partialize: (state) => ({ completedPuzzles: state.completedPuzzles }),
    }
  )
);
