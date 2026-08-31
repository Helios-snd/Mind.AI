/**
 * Local persistence for the daily check-in.
 *
 * Frontend-only for now: entries live in localStorage so a refresh keeps the
 * day's check-in and the trend history builds up while the backend is wired.
 *
 * TODO(backend): replace load/save with the SIGNAL + TREND endpoints. The shape
 * below is the payload a check-in POST should send.
 */

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export type CheckIn = {
  /** Local calendar day, YYYY-MM-DD. One "primary" check-in per day. */
  date: string;
  /** Full timestamp of when it was saved. */
  at: string;
  mood: MoodValue;
  /** Hours, 0–12 in 0.5 steps. */
  sleepHours: number;
  note: string;
};

const STORAGE_KEY = "aimind.today.v1";

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole days between a YYYY-MM-DD key and today (0 = today, 1 = yesterday). */
export function daysSince(key: string, now = new Date()): number {
  const [y, m, d] = key.split("-").map(Number);
  const then = new Date(y, m - 1, d).getTime();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((midnight - then) / 86_400_000);
}

export function loadCheckIns(): CheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCheckIn).sort((a, b) => a.at.localeCompare(b.at));
  } catch {
    return [];
  }
}

/** Append an entry and return the updated, time-sorted list. */
export function saveCheckIn(entry: CheckIn): CheckIn[] {
  const next = [...loadCheckIns(), entry].sort((a, b) => a.at.localeCompare(b.at));
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage full or blocked — the return value still updates this session
    }
  }
  return next;
}

/** The most recent entry logged today, if any. */
export function latestToday(entries: CheckIn[]): CheckIn | undefined {
  const key = todayKey();
  return [...entries].reverse().find((entry) => entry.date === key);
}

/** Delete a single check-in by its timestamp. Returns the updated list. */
export function deleteCheckIn(at: string): CheckIn[] {
  const next = loadCheckIns().filter((entry) => entry.at !== at);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore — the return value still reflects the delete this session
    }
  }
  return next;
}

function isCheckIn(value: unknown): value is CheckIn {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.date === "string" &&
    typeof v.at === "string" &&
    typeof v.mood === "number" &&
    typeof v.sleepHours === "number" &&
    typeof v.note === "string"
  );
}
