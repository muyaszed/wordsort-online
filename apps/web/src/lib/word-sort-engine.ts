import type { CategoryDef, TileState, WordSortState, WordTileData } from "./word-sort-types";

// Mulberry32 — fast, seedable PRNG. Seeding by date ensures all players see the same tile order.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
  };
}

function dateToSeed(dateStr: string): number {
  // 'YYYY-MM-DD' → stable integer, e.g. '2026-06-13' → 20260613
  return dateStr.split('-').reduce((acc, part) => acc * 100 + parseInt(part, 10), 0);
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// puzzleId is 'YYYY-MM-DD'; when provided the shuffle is deterministic so all players see the same board.
export function createWordSortGame(categories: CategoryDef[], puzzleId?: string): WordSortState {
  const rand = puzzleId ? mulberry32(dateToSeed(puzzleId)) : Math.random.bind(Math);
  const allWords = shuffle(categories.flatMap((c) => c.words), rand);
  const tiles: WordTileData[] = allWords.map((word, i) => ({
    id: `tile-${i}`,
    word,
    categoryId: null,
    state: "idle",
  }));
  return {
    tiles,
    categories,
    solvedIds: [],
    mistakes: 0,
    solved: false,
    startedAt: null,
    solvedAt: null,
  };
}

export function tryPlaceTile(
  state: WordSortState,
  tileId: string,
  categoryId: string
): { nextState: WordSortState; accepted: boolean } {
  const category = state.categories.find((c) => c.id === categoryId);
  const tile = state.tiles.find((t) => t.id === tileId);

  if (!category || !tile) return { nextState: state, accepted: false };
  if (state.solvedIds.includes(categoryId)) return { nextState: state, accepted: false };

  // Prevent placing a tile that's already correct/revealed elsewhere
  if (tile.state === "correct" || tile.state === "revealed") {
    return { nextState: state, accepted: false };
  }

  // Count tiles already correctly placed in this category
  const correctInCategory = state.tiles.filter(
    (t) => t.categoryId === categoryId && (t.state === "correct" || t.state === "revealed")
  );
  if (correctInCategory.length >= 4) return { nextState: state, accepted: false };

  const isCorrect = category.words.includes(tile.word);
  const startedAt = state.startedAt ?? Date.now();

  if (isCorrect) {
    let tiles = state.tiles.map((t) =>
      t.id === tileId ? { ...t, categoryId, state: "correct" as TileState } : t
    );

    const nowCorrectInCat = tiles.filter(
      (t) => t.categoryId === categoryId && t.state === "correct"
    );

    let solvedIds = state.solvedIds;
    let solved = state.solved;
    let solvedAt = state.solvedAt;

    if (nowCorrectInCat.length === 4) {
      tiles = tiles.map((t) =>
        t.categoryId === categoryId ? { ...t, state: "revealed" as TileState } : t
      );
      solvedIds = [...state.solvedIds, categoryId];
      solved = solvedIds.length === state.categories.length;
      solvedAt = solved ? Date.now() : null;
    }

    return {
      nextState: { ...state, tiles, solvedIds, solved, solvedAt, startedAt },
      accepted: true,
    };
  } else {
    // Mark tile incorrect temporarily — it stays in pool (categoryId: null)
    const tiles = state.tiles.map((t) =>
      t.id === tileId ? { ...t, state: "incorrect" as TileState } : t
    );
    return {
      nextState: { ...state, tiles, startedAt, mistakes: state.mistakes + 1 },
      accepted: false,
    };
  }
}

export function resetTileToPool(state: WordSortState, tileId: string): WordSortState {
  const tiles = state.tiles.map((t) =>
    t.id === tileId && t.state === "incorrect"
      ? { ...t, categoryId: null, state: "idle" as TileState }
      : t
  );
  return { ...state, tiles };
}
