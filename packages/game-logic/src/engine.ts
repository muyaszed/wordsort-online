import type { GameState, Grid, Tile } from './types.js';

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

function buildGrid(words: string[], tiles: Tile[]): Grid {
  const grid: Grid = [];
  let idx = 0;
  for (const word of words) {
    const row: Tile[] = [];
    for (let i = 0; i < word.length; i++) {
      row.push(tiles[idx++]!);
    }
    grid.push(row);
  }
  return grid;
}

export function createGame(targetWords: string[]): GameState {
  const normalized = targetWords.map(w => w.toUpperCase());

  const allTiles: Tile[] = normalized.flatMap((word, wi) =>
    [...word].map((letter, li) => ({ id: `${wi}-${li}`, letter }))
  );

  let shuffledTiles = shuffle(allTiles);

  // Re-shuffle if the initial arrangement is already solved
  while (
    normalized.every((word, i) => {
      const start = normalized.slice(0, i).reduce((s, w) => s + w.length, 0);
      return [...word].every((l, j) => shuffledTiles[start + j]!.letter === l);
    })
  ) {
    shuffledTiles = shuffle(allTiles);
  }

  return {
    grid: buildGrid(normalized, shuffledTiles),
    targetWords: normalized,
    moveCount: 0,
    startedAt: null,
    solvedAt: null,
    solved: false,
  };
}

export function getRowWord(state: GameState, rowIndex: number): string {
  return state.grid[rowIndex]!.map(t => t.letter).join('');
}

export function checkSolved(state: GameState): boolean {
  return state.targetWords.every((word, i) => getRowWord(state, i) === word);
}

function applyMove(state: GameState, newGrid: Grid, now: number = Date.now()): GameState {
  const startedAt = state.startedAt ?? now;
  const next: GameState = {
    ...state,
    grid: newGrid,
    moveCount: state.moveCount + 1,
    startedAt,
  };
  const solved = checkSolved(next);
  return {
    ...next,
    solved,
    solvedAt: solved && !state.solved ? now : state.solvedAt,
  };
}

export function slideRow(
  state: GameState,
  rowIndex: number,
  direction: 'left' | 'right',
  now?: number
): GameState {
  const row = state.grid[rowIndex];
  if (!row || row.length === 0) return state;

  const newRow =
    direction === 'left'
      ? [...row.slice(1), row[0]!]
      : [row[row.length - 1]!, ...row.slice(0, -1)];

  const newGrid = state.grid.map((r, i) => (i === rowIndex ? newRow : r));
  return applyMove(state, newGrid, now);
}

export function slideCol(
  state: GameState,
  colIndex: number,
  direction: 'up' | 'down',
  now?: number
): GameState {
  // Only rows that are wide enough to have this column
  const rowIndices = state.grid.reduce<number[]>((acc, row, i) => {
    if (colIndex < row.length) acc.push(i);
    return acc;
  }, []);

  if (rowIndices.length === 0) return state;

  const tiles = rowIndices.map(i => state.grid[i]![colIndex]!);
  const newTiles =
    direction === 'up'
      ? [...tiles.slice(1), tiles[0]!]
      : [tiles[tiles.length - 1]!, ...tiles.slice(0, -1)];

  const newGrid = state.grid.map((row, rowIdx) => {
    const pos = rowIndices.indexOf(rowIdx);
    if (pos === -1) return row;
    return row.map((tile, colIdx) => (colIdx === colIndex ? newTiles[pos]! : tile));
  });

  return applyMove(state, newGrid, now);
}

export function getElapsedMs(state: GameState, now: number = Date.now()): number {
  if (!state.startedAt) return 0;
  return (state.solvedAt ?? now) - state.startedAt;
}

export function validateWords(words: string[]): { valid: boolean; reason?: string } {
  if (words.length !== 5) {
    return { valid: false, reason: 'Puzzle must have exactly 5 words' };
  }
  const fiveLetterCount = words.filter(w => w.length === 5).length;
  const fourLetterCount = words.filter(w => w.length === 4).length;
  if (fiveLetterCount !== 4 || fourLetterCount !== 1) {
    return {
      valid: false,
      reason: 'Puzzle must have exactly 4 five-letter words and 1 four-letter word',
    };
  }
  if (words.some(w => !/^[A-Za-z]+$/.test(w))) {
    return { valid: false, reason: 'Words must contain only letters' };
  }
  return { valid: true };
}
