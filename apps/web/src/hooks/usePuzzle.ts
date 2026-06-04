"use client";

import {
  createGame,
  getElapsedMs,
  slideCol,
  type GameState,
} from "@wordsort/game-logic";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePuzzleReturn {
  state: GameState;
  elapsedMs: number;
  slideColUp: (colIndex: number) => void;
  slideColDown: (colIndex: number) => void;
  reset: () => void;
}

export function usePuzzle(words: string[]): UsePuzzleReturn {
  const [state, setState] = useState<GameState>(() => createGame(words));
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const wordsRef = useRef(words);

  useEffect(() => {
    wordsRef.current = words;
  });

  useEffect(() => {
    if (!state.startedAt || state.solved) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (state.solved) setElapsedMs(getElapsedMs(state));
      return;
    }

    const tick = () => {
      setElapsedMs(getElapsedMs(state));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state]);

  const slideColUp = useCallback((colIndex: number) => {
    setState((s) => slideCol(s, colIndex, "up"));
  }, []);

  const slideColDown = useCallback((colIndex: number) => {
    setState((s) => slideCol(s, colIndex, "down"));
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState(createGame(wordsRef.current));
    setElapsedMs(0);
  }, []);

  return {
    state,
    elapsedMs,
    slideColUp,
    slideColDown,
    reset,
  };
}
