export interface Word {
  id: string;
  text: string;
  category: string;
}

export interface GameState {
  words: Word[];
  sorted: Record<string, Word[]>;
  complete: boolean;
  score: number;
}

export type SortResult = "correct" | "incorrect" | "complete";
