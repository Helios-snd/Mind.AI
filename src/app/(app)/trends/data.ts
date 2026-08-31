import type { Keys } from "@/i18n/en";
import { loadCheckIns } from "../today/storage";

/**
 * Fixture stand-in for the TREND agent.
 *
 * The weekly series, the personal baseline bands, the insight sentence and the
 * noticed-patterns list are all hard-coded here. The current week's mood and
 * sleep are folded in from the user's real check-ins so the tail of the chart
 * moves as they use the app.
 *
 * TODO(backend): TREND owns the baseline (seeded from the DASS-21 baseline and
 * the first weeks), the slope detection, and the weekly insight sentence.
 */
export type SeriesId = "mood" | "sleep" | "energy" | "social";

export type WeekPoint = {
  /** Monday of the week, YYYY-MM-DD. */
  weekStart: string;
  mood: number;
  sleep: number;
  energy: number;
  social: number;
};

export type SeriesMeta = {
  id: SeriesId;
  labelKey: Keys;
  min: number;
  max: number;
  /** The user's own usual range — never a population average. */
  baseline: [number, number];
};

export const SERIES: SeriesMeta[] = [
  { id: "mood", labelKey: "trends.series.mood", min: 1, max: 5, baseline: [2.5, 4] },
  { id: "sleep", labelKey: "trends.series.sleep", min: 0, max: 10, baseline: [6, 8] },
  { id: "energy", labelKey: "trends.series.energy", min: 1, max: 5, baseline: [2.5, 4] },
  { id: "social", labelKey: "trends.series.social", min: 1, max: 5, baseline: [2.5, 4] },
];

export type Trends = {
  weeks: WeekPoint[];
  insightKey: Keys;
  patternKeys: Keys[];
};

const FIXTURE: Omit<WeekPoint, "weekStart">[] = [
  { mood: 3.6, sleep: 7.4, energy: 3.5, social: 3.4 },
  { mood: 3.4, sleep: 7.0, energy: 3.3, social: 3.0 },
  { mood: 3.1, sleep: 6.3, energy: 3.0, social: 2.8 },
  { mood: 2.6, sleep: 5.6, energy: 2.5, social: 2.3 },
  { mood: 2.3, sleep: 5.1, energy: 2.2, social: 2.0 },
  { mood: 2.5, sleep: 5.9, energy: 2.4, social: 2.2 },
];

/** How many check-ins before Trends has something honest to show. */
export const MIN_CHECKINS = 3;

export function hasEnoughData(): boolean {
  return loadCheckIns().length >= MIN_CHECKINS;
}

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round1 = (x: number) => Math.round(x * 10) / 10;

export function buildTrends(): Trends {
  const thisMonday = mondayOf(new Date());

  const weeks: WeekPoint[] = FIXTURE.map((point, i) => {
    const start = new Date(thisMonday);
    start.setDate(start.getDate() - (FIXTURE.length - 1 - i) * 7);
    return { weekStart: ymd(start), ...point };
  });

  const recent = loadCheckIns().filter(
    (c) => new Date(c.at).getTime() >= thisMonday.getTime(),
  );
  if (recent.length > 0) {
    const last = weeks[weeks.length - 1];
    last.mood = round1(avg(recent.map((c) => c.mood)));
    last.sleep = round1(avg(recent.map((c) => c.sleepHours)));
  }

  return {
    weeks,
    insightKey: "trends.insight",
    patternKeys: ["trends.pattern.1", "trends.pattern.2", "trends.pattern.3"],
  };
}
