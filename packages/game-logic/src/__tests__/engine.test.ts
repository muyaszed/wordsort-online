import {
  checkSolved,
  createGame,
  getElapsedMs,
  getRowWord,
  slideCol,
  slideRow,
  validateWords,
} from '../engine.js';
import type { GameState, Tile } from '../types.js';

const WORDS = ['CRANE', 'FLUTE', 'GHOST', 'BRISK', 'LAMP'];

function solvedState(): GameState {
  const grid = WORDS.map((word, wi) =>
    [...word].map((letter, li): Tile => ({ id: `${wi}-${li}`, letter }))
  );
  return {
    grid,
    targetWords: WORDS,
    moveCount: 0,
    startedAt: null,
    solvedAt: null,
    solved: false,
  };
}

describe('createGame', () => {
  it('creates a grid with correct dimensions', () => {
    const state = createGame(WORDS);
    expect(state.grid).toHaveLength(5);
    expect(state.grid[0]).toHaveLength(5);
    expect(state.grid[4]).toHaveLength(4);
  });

  it('preserves all letters (multiset)', () => {
    const state = createGame(WORDS);
    const expected = WORDS.join('').split('').sort();
    const actual = state.grid.flat().map(t => t.letter).sort();
    expect(actual).toEqual(expected);
  });

  it('starts with zero moves and no timer', () => {
    const state = createGame(WORDS);
    expect(state.moveCount).toBe(0);
    expect(state.startedAt).toBeNull();
    expect(state.solved).toBe(false);
  });

  it('assigns unique tile ids', () => {
    const state = createGame(WORDS);
    const ids = state.grid.flat().map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('validateWords', () => {
  it('accepts 4 five-letter + 1 four-letter words', () => {
    expect(validateWords(WORDS).valid).toBe(true);
  });

  it('rejects wrong count', () => {
    expect(validateWords(['CRANE', 'FLUTE']).valid).toBe(false);
  });

  it('rejects wrong word lengths', () => {
    expect(validateWords(['CRANE', 'FLUTE', 'GHOST', 'BRISK', 'LAMPS']).valid).toBe(false);
  });

  it('rejects non-alpha characters', () => {
    expect(validateWords(['CRANE', 'FLUTE', 'GHOST', 'BRI5K', 'LAMP']).valid).toBe(false);
  });
});

describe('slideRow', () => {
  it('rotates a row left', () => {
    const state = solvedState();
    const next = slideRow(state, 0, 'left');
    expect(getRowWord(next, 0)).toBe('RANEC');
  });

  it('rotates a row right', () => {
    const state = solvedState();
    const next = slideRow(state, 0, 'right');
    expect(getRowWord(next, 0)).toBe('ECRAN');
  });

  it('does not mutate other rows', () => {
    const state = solvedState();
    const next = slideRow(state, 0, 'left');
    expect(getRowWord(next, 1)).toBe('FLUTE');
  });

  it('increments move count', () => {
    const state = solvedState();
    const next = slideRow(state, 0, 'left');
    expect(next.moveCount).toBe(1);
  });

  it('starts the timer on first move', () => {
    const state = solvedState();
    const now = 1000;
    const next = slideRow(state, 0, 'left', now);
    expect(next.startedAt).toBe(now);
  });

  it('preserves timer on subsequent moves', () => {
    const state = solvedState();
    const s1 = slideRow(state, 0, 'left', 1000);
    const s2 = slideRow(s1, 0, 'right', 2000);
    expect(s2.startedAt).toBe(1000);
    expect(s2.moveCount).toBe(2);
  });

  it('works on 4-letter row', () => {
    const state = solvedState();
    const next = slideRow(state, 4, 'left');
    expect(getRowWord(next, 4)).toBe('AMPL');
  });
});

describe('slideCol', () => {
  it('rotates a column up', () => {
    const state = solvedState();
    const next = slideCol(state, 0, 'up');
    // col 0 was: C, F, G, B, L → after up: F, G, B, L, C
    expect(next.grid[0]![0]!.letter).toBe('F');
    expect(next.grid[1]![0]!.letter).toBe('G');
    expect(next.grid[4]![0]!.letter).toBe('C');
  });

  it('rotates a column down', () => {
    const state = solvedState();
    const next = slideCol(state, 0, 'down');
    // col 0 was: C, F, G, B, L → after down: L, C, F, G, B
    expect(next.grid[0]![0]!.letter).toBe('L');
    expect(next.grid[1]![0]!.letter).toBe('C');
    expect(next.grid[4]![0]!.letter).toBe('B');
  });

  it('only affects rows that have this column', () => {
    const state = solvedState();
    // col 4 only exists in rows 0-3 (not row 4 which is 4-letter LAMP)
    const next = slideCol(state, 4, 'up');
    expect(next.grid[4]).toHaveLength(4);
    // col 4 was: E, E, T, K → after up: E, T, K, E
    expect(next.grid[0]![4]!.letter).toBe('E');
    expect(next.grid[1]![4]!.letter).toBe('T');
    expect(next.grid[2]![4]!.letter).toBe('K');
    expect(next.grid[3]![4]!.letter).toBe('E');
  });

  it('increments move count', () => {
    const state = solvedState();
    const next = slideCol(state, 0, 'up');
    expect(next.moveCount).toBe(1);
  });
});

describe('checkSolved and solution detection', () => {
  it('detects solved state', () => {
    const state = solvedState();
    expect(checkSolved(state)).toBe(true);
  });

  it('returns false when not solved', () => {
    const state = solvedState();
    const next = slideRow(state, 0, 'left');
    expect(next.solved).toBe(false);
  });

  it('marks solved and records solvedAt when all words match', () => {
    // Start from solved state slid once, then slide back
    const state = solvedState();
    const now = 5000;
    const s1 = slideRow({ ...state, startedAt: 1000 }, 0, 'left', 3000);
    const s2 = slideRow(s1, 0, 'right', now);
    expect(s2.solved).toBe(true);
    expect(s2.solvedAt).toBe(now);
  });
});

describe('getElapsedMs', () => {
  it('returns 0 before first move', () => {
    const state = solvedState();
    expect(getElapsedMs(state)).toBe(0);
  });

  it('returns elapsed time during play', () => {
    const state: GameState = { ...solvedState(), startedAt: 1000 };
    expect(getElapsedMs(state, 3000)).toBe(2000);
  });

  it('freezes at solvedAt after solve', () => {
    const state: GameState = { ...solvedState(), startedAt: 1000, solvedAt: 4000, solved: true };
    expect(getElapsedMs(state, 9000)).toBe(3000);
  });
});
