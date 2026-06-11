export type Cell = string | null;
export type PuzzleGrid = Cell[];

export interface PuzzleState {
  grid: PuzzleGrid;
  targetWords: string[];
  moveCount: number;
  startedAt: number | null;
  solvedAt: number | null;
  solved: boolean;
}

export function findEmpty(grid: PuzzleGrid): number {
  return grid.indexOf(null);
}

export function canSlide(grid: PuzzleGrid, tileIndex: number): boolean {
  if (grid[tileIndex] === null) return false;
  const emptyIndex = grid.indexOf(null);
  const tileRow = Math.floor(tileIndex / 5);
  const tileCol = tileIndex % 5;
  const emptyRow = Math.floor(emptyIndex / 5);
  const emptyCol = emptyIndex % 5;
  return (
    (tileRow === emptyRow && Math.abs(tileCol - emptyCol) === 1) ||
    (tileCol === emptyCol && Math.abs(tileRow - emptyRow) === 1)
  );
}

export function slideTile(
  state: PuzzleState,
  tileIndex: number,
  now = Date.now()
): PuzzleState {
  if (!canSlide(state.grid, tileIndex)) return state;
  const emptyIndex = findEmpty(state.grid);
  const newGrid = [...state.grid];
  newGrid[emptyIndex] = newGrid[tileIndex];
  newGrid[tileIndex] = null;
  const startedAt = state.startedAt ?? now;
  const moveCount = state.moveCount + 1;
  const solved = checkSolved({ ...state, grid: newGrid });
  return {
    ...state,
    grid: newGrid,
    moveCount,
    startedAt,
    solved,
    solvedAt: solved && !state.solved ? now : state.solvedAt,
  };
}

function findWordHorizontal(grid: PuzzleGrid, word: string): number[] | null {
  for (let row = 0; row < 5; row++) {
    const start = row * 5;
    const cells = grid.slice(start, start + 5);
    if (word.length === 5) {
      if (cells.every((c) => c !== null) && cells.join("") === word)
        return [start, start + 1, start + 2, start + 3, start + 4];
    } else {
      if (cells[4] === null && cells.slice(0, 4).join("") === word)
        return [start, start + 1, start + 2, start + 3];
    }
  }
  return null;
}

function findWordVertical(grid: PuzzleGrid, word: string): number[] | null {
  for (let col = 0; col < 5; col++) {
    const cells = [0, 1, 2, 3, 4].map((row) => grid[row * 5 + col]);
    if (word.length === 5) {
      if (cells.every((c) => c !== null) && cells.join("") === word)
        return [col, col + 5, col + 10, col + 15, col + 20];
    } else {
      if (cells[4] === null && cells.slice(0, 4).join("") === word)
        return [col, col + 5, col + 10, col + 15];
    }
  }
  return null;
}

function findWordHorizontalReversed(grid: PuzzleGrid, word: string): number[] | null {
  for (let row = 0; row < 5; row++) {
    const start = row * 5;
    const cells = grid.slice(start, start + 5);
    if (word.length === 5) {
      if (cells.every((c) => c !== null) && [...cells].reverse().join("") === word)
        return [start, start + 1, start + 2, start + 3, start + 4];
    } else {
      // null on left; cells 1–4 read right-to-left spell the word
      if (cells[0] === null && cells.slice(1).reverse().join("") === word)
        return [start + 1, start + 2, start + 3, start + 4];
    }
  }
  return null;
}

function findWordVerticalReversed(grid: PuzzleGrid, word: string): number[] | null {
  for (let col = 0; col < 5; col++) {
    const cells = [0, 1, 2, 3, 4].map((row) => grid[row * 5 + col]);
    if (word.length === 5) {
      if (cells.every((c) => c !== null) && [...cells].reverse().join("") === word)
        return [col, col + 5, col + 10, col + 15, col + 20];
    } else {
      // null at top (row 0); rows 1–4 read bottom-to-top spell the word
      if (cells[0] === null && cells.slice(1).reverse().join("") === word)
        return [col + 5, col + 10, col + 15, col + 20];
    }
  }
  return null;
}

function findWord(grid: PuzzleGrid, word: string): number[] | null {
  return (
    findWordHorizontal(grid, word) ??
    findWordVertical(grid, word) ??
    findWordHorizontalReversed(grid, word) ??
    findWordVerticalReversed(grid, word)
  );
}

export function getSolvedCells(state: PuzzleState): Set<number> {
  const solved = new Set<number>();
  for (const word of state.targetWords) {
    const indices = findWord(state.grid, word);
    if (indices) indices.forEach((i) => solved.add(i));
  }
  return solved;
}

export function getSolvedWordSet(state: PuzzleState): Set<string> {
  return new Set(
    state.targetWords.filter((word) => findWord(state.grid, word) !== null)
  );
}

export function checkSolved(state: PuzzleState): boolean {
  return state.targetWords.every((word) => findWord(state.grid, word) !== null);
}

export function getElapsed(state: PuzzleState, now = Date.now()): number {
  if (!state.startedAt) return 0;
  return (state.solvedAt ?? now) - state.startedAt;
}

function solvedGrid(words: string[]): PuzzleGrid {
  const grid: PuzzleGrid = new Array(25).fill(null);
  for (let row = 0; row < words.length; row++) {
    const word = words[row]!;
    for (let col = 0; col < word.length; col++) {
      grid[row * 5 + col] = word[col]!;
    }
  }
  return grid;
}

export function createPuzzle(words: string[]): PuzzleState {
  const normalized = words.map((w) => w.toUpperCase());
  let state: PuzzleState = {
    grid: solvedGrid(normalized),
    targetWords: normalized,
    moveCount: 0,
    startedAt: null,
    solvedAt: null,
    solved: false,
  };

  for (let i = 0; i < 200; i++) {
    const slideable = state.grid
      .map((c, idx) => ({ c, idx }))
      .filter(({ c, idx }) => c !== null && canSlide(state.grid, idx));
    const pick = slideable[Math.floor(Math.random() * slideable.length)];
    if (pick) {
      state = { ...slideTile(state, pick.idx), moveCount: 0, startedAt: null };
    }
  }

  return { ...state, solved: false };
}
