export type Tile = {
  id: string;
  letter: string;
};

export type Grid = Tile[][];

export type SlideDirection = 'left' | 'right' | 'up' | 'down';

export type GameState = {
  grid: Grid;
  targetWords: string[];
  moveCount: number;
  startedAt: number | null;
  solvedAt: number | null;
  solved: boolean;
};
