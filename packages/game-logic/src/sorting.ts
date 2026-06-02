import type { GameState, SortResult, Word } from "./types.js";

export function createGameState(words: Word[]): GameState {
  return {
    words: [...words],
    sorted: {},
    complete: false,
    score: 0,
  };
}

export function placeWord(
  state: GameState,
  wordId: string,
  targetCategory: string
): { state: GameState; result: SortResult } {
  const word = state.words.find((w) => w.id === wordId);
  if (!word) return { state, result: "incorrect" };

  const correct = word.category === targetCategory;
  const sorted = { ...state.sorted };

  if (correct) {
    sorted[targetCategory] = [...(sorted[targetCategory] ?? []), word];
  }

  const remaining = state.words.filter((w) => w.id !== wordId);
  const complete = correct && remaining.length === 0;

  return {
    state: {
      words: correct ? remaining : state.words,
      sorted,
      complete,
      score: state.score + (correct ? 10 : 0),
    },
    result: complete ? "complete" : correct ? "correct" : "incorrect",
  };
}
