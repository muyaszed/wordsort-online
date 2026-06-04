"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  canSlide,
  createPuzzle,
  getElapsed,
  slideTile,
  type PuzzleState,
} from "@/lib/puzzle-engine";

export interface UsePuzzleReturn {
  state: PuzzleState;
  elapsedMs: number;
  slideTileAt: (index: number) => void;
  canSlideAt: (index: number) => boolean;
  reset: () => void;
}

export function usePuzzle(words: string[]): UsePuzzleReturn {
  const [state, setState] = useState<PuzzleState>(() => createPuzzle(words));
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const wordsRef = useRef(words);
  const stateRef = useRef(state);

  useEffect(() => {
    wordsRef.current = words;
  });

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (!state.startedAt || state.solved) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (state.solved) setElapsedMs(getElapsed(state));
      return;
    }

    const tick = () => {
      setElapsedMs(getElapsed(stateRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.startedAt, state.solved]);

  const slideTileAt = useCallback((index: number) => {
    setState((s) => slideTile(s, index));
  }, []);

  const canSlideAt = useCallback(
    (index: number) => canSlide(state.grid, index),
    [state.grid]
  );

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState(createPuzzle(wordsRef.current));
    setElapsedMs(0);
  }, []);

  return { state, elapsedMs, slideTileAt, canSlideAt, reset };
}
