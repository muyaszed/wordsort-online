const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api";

export interface DailyWordSet {
  id: string;
  date: string;
  words: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  steps: number;
  timeSeconds: number;
  submittedAt: string;
}

export async function fetchDailyWords(): Promise<DailyWordSet | null> {
  try {
    const res = await fetch(`${API_URL}/words`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json() as Promise<DailyWordSet>;
  } catch {
    return null;
  }
}

export async function submitScore(payload: {
  name: string;
  steps: number;
  timeSeconds: number;
}): Promise<LeaderboardEntry | null> {
  try {
    const res = await fetch(`${API_URL}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return res.json() as Promise<LeaderboardEntry>;
  } catch {
    return null;
  }
}

export async function fetchLeaderboard(
  limit = 10
): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${API_URL}/leaderboard?limit=${limit}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json() as Promise<LeaderboardEntry[]>;
  } catch {
    return [];
  }
}
