"use client";

import { useCallback, useRef, useState } from "react";
import {
  createWordSortGame,
  resetTileToPool,
  tryPlaceTile,
} from "@/lib/word-sort-engine";
import type { CategoryDef, WordSortState } from "@/lib/word-sort-types";

export interface UseWordSortReturn {
  state: WordSortState;
  registerZone: (categoryId: string, el: HTMLElement | null) => void;
  onTileDragEnd: (tileId: string, x: number, y: number) => void;
  reset: () => void;
}

export function useWordSort(categories: CategoryDef[], puzzleId?: string): UseWordSortReturn {
  const [state, setState] = useState<WordSortState>(() =>
    createWordSortGame(categories, puzzleId)
  );
  const zoneRefs = useRef<Map<string, HTMLElement>>(new Map());
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;
  const puzzleIdRef = useRef(puzzleId);
  puzzleIdRef.current = puzzleId;

  const registerZone = useCallback(
    (categoryId: string, el: HTMLElement | null) => {
      if (el) zoneRefs.current.set(categoryId, el);
      else zoneRefs.current.delete(categoryId);
    },
    []
  );

  const onTileDragEnd = useCallback((tileId: string, x: number, y: number) => {
    let targetCategoryId: string | null = null;

    for (const [catId, el] of zoneRefs.current) {
      const rect = el.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        targetCategoryId = catId;
        break;
      }
    }

    if (!targetCategoryId) return;

    setState((s) => {
      const { nextState, accepted } = tryPlaceTile(s, tileId, targetCategoryId!);
      if (!accepted) {
        setTimeout(() => {
          setState((ss) => resetTileToPool(ss, tileId));
        }, 650);
      }
      return nextState;
    });
  }, []);

  const reset = useCallback(() => {
    setState(createWordSortGame(categoriesRef.current, puzzleIdRef.current));
  }, []);

  return { state, registerZone, onTileDragEnd, reset };
}
