/**
 * Date helpers for the daily check-in.
 *
 * This file used to own check-in persistence in localStorage. PostgreSQL is
 * the source of truth from slice B on, and the reads and writes live in
 * src/api/hooks.ts, so what remains here is the local-calendar arithmetic the
 * screen still needs.
 *
 * The day key is deliberately computed from the browser's own clock rather
 * than the server's: a 1am check-in in Kolkata belongs to that student's day,
 * not to whatever date it happens to be in UTC.
 */

import type { CheckIn, ScaleValue } from "@/api/types";

export type { CheckIn, ScaleValue };
export type MoodValue = ScaleValue;

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole days between a YYYY-MM-DD key and today (0 = today, 1 = yesterday). */
export function daysSince(key: string, now = new Date()): number {
  const [y, m, d] = key.split("-").map(Number);
  const then = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - then.getTime()) / 86_400_000);
}

export function latestToday(entries: CheckIn[]): CheckIn | undefined {
  const key = todayKey();
  return entries.find((entry) => entry.date === key);
}
