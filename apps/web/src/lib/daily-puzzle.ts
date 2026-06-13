import type { CategoryDef, ZoneColor } from "./word-sort-types";

export function getTodayPuzzleId(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getYesterdayPuzzleId(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getMsUntilMidnightUTC(): number {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return Math.max(0, nextMidnight.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

const COLOR_EMOJI: Record<ZoneColor, string> = {
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  purple: "🟪",
};

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function buildShareSquares(
  solvedIds: string[],
  categories: CategoryDef[]
): string {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  return solvedIds
    .map((id) => COLOR_EMOJI[catMap[id]?.color ?? "green"] ?? "🟩")
    .join("");
}

export function buildShareText(opts: {
  puzzleId: string;
  title?: string;
  mistakes: number;
  elapsedMs: number;
  shareSquares: string;
}): string {
  const { puzzleId, title, mistakes, elapsedMs, shareSquares } = opts;

  const dateLabel = new Date(puzzleId + "T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }
  );

  const titleLine = title ? `WordSort · ${title}` : "WordSort";
  const mistakeLine =
    mistakes === 0
      ? "No mistakes! 🎉"
      : `${mistakes} mistake${mistakes !== 1 ? "s" : ""}`;

  return `${titleLine}\n${dateLabel}\n\n${shareSquares}\n⏱ ${formatTime(elapsedMs)} · ${mistakeLine}\n\nPlay at: wordsort.app`;
}
