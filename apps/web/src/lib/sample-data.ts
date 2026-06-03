export interface PuzzleDefinition {
  id: string;
  date: string;
  title: string;
  words: string[];
}

export const DAILY_PUZZLE: PuzzleDefinition = {
  id: "2026-06-03",
  date: "2026-06-03",
  title: "June 3",
  words: ["CRANE", "FLUTE", "GHOST", "BRISK", "LAMP"],
};

export const PUZZLE_BANK: PuzzleDefinition[] = [
  DAILY_PUZZLE,
  {
    id: "2026-06-04",
    date: "2026-06-04",
    title: "June 4",
    words: ["FLAME", "GROVE", "SWEPT", "CHILD", "HUNT"],
  },
  {
    id: "2026-06-05",
    date: "2026-06-05",
    title: "June 5",
    words: ["TRACK", "BLOOM", "PRIZE", "FLUNG", "MIST"],
  },
];
