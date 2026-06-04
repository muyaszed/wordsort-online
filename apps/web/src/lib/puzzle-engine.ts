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

export function checkSolved(state: PuzzleState): boolean {
  for (let row = 0; row < 5; row++) {
    const target = state.targetWords[row];
    if (!target) return false;
    const start = row * 5;
    const rowCells = state.grid.slice(start, start + 5);
    if (target.length === 5) {
      if (rowCells.some((c) => c === null)) return false;
      if (rowCells.join("") !== target) return false;
    } else {
      if (rowCells[4] !== null) return false;
      if (rowCells.slice(0, 4).join("") !== target) return false;
    }
  }
  return true;
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
