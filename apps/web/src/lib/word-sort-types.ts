export type TileState = "idle" | "dragging" | "correct" | "incorrect" | "revealed";

export type ZoneColor = "yellow" | "green" | "blue" | "purple";

export interface WordTileData {
  id: string;
  word: string;
  categoryId: string | null;
  state: TileState;
}

export interface CategoryDef {
  id: string;
  name: string;
  color: ZoneColor;
  words: string[];
}

export interface WordSortState {
  tiles: WordTileData[];
  categories: CategoryDef[];
  solvedIds: string[];
  mistakes: number;
  solved: boolean;
  startedAt: number | null;
  solvedAt: number | null;
}
