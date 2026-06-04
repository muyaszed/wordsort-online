export type { GameState, Grid, SlideDirection, Tile } from './types.js';
export {
  checkSolved,
  createGame,
  getElapsedMs,
  getRowWord,
  slideCol,
  slideRow,
  validateWords,
} from './engine.js';
