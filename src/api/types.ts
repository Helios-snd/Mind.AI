export type Language = "en" | "bn";

export type CrisisPlan = {
  whoIdCall: string;
  whatHelps: string;
  whatMakesItWorse: string;
};

export type TrustedContact = {
  name: string;
  relationship: string;
  phone: string;
};

export type BaselineAnswer = {
  itemId: string;
  value: 0 | 1 | 2 | 3;
};

// 5 is the "keep your account" claim screen, which follows completion.
export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export type OnboardingProgress = {
  step: OnboardingStep;
  language?: Language;
  baseline?: BaselineAnswer[];
  consentAt?: string;
  crisisPlan?: CrisisPlan;
  contact?: TrustedContact;
  completedAt?: string;
};

/** The 1–5 frame shared by mood, energy and social contact. */
export type ScaleValue = 1 | 2 | 3 | 4 | 5;

export type Suggestion = { titleKey: string; bodyKey: string };

/**
 * The acknowledgement the server chose for a check-in.
 *
 * Keys rather than prose, so every user-facing string stays in src/i18n. When
 * COMPANION starts generating free text this widens rather than changes.
 */
export type Reflection = {
  ackKey: string;
  suggestion: Suggestion | null;
};

export type CheckIn = {
  /** The student's own calendar day, YYYY-MM-DD. */
  date: string;
  /** When it was saved. Also the identity of the row for the UI. */
  at: string;
  mood: ScaleValue;
  sleepHours: number;
  /** Null on rows written before these were collected. Never zero-filled. */
  energy: ScaleValue | null;
  social: ScaleValue | null;
  appetite: ScaleValue | null;
  activity: ScaleValue | null;
  note: string;
  reflection: Reflection;
};

export type CheckInDraft = {
  date: string;
  mood: ScaleValue;
  sleepHours: number;
  energy: ScaleValue | null;
  social: ScaleValue | null;
  appetite: ScaleValue | null;
  activity: ScaleValue | null;
  note: string;
};

export type TrendRange = "7d" | "4w" | "6w";
export type SeriesId = "mood" | "sleep" | "energy" | "social";

export type TrendPoint = { at: string; value: number };

/** The student's own usual range. There is no population norm anywhere. */
export type TrendBaseline = { low: number; high: number };

export type TrendSeries = {
  id: SeriesId;
  /** Empty when there is too little in the window to plot honestly. */
  points: TrendPoint[];
  average: number | null;
  current: number | null;
  high: number | null;
  low: number | null;
  /** Against the previous window of equal length; null if there isn't one. */
  change: number | null;
  /** Null until there is enough older history to call anything "usual". */
  baseline: TrendBaseline | null;
  direction: "declining" | "rising" | "steady" | null;
  relation: "below" | "within" | "above" | null;
  observationKey: string | null;
  tipKey: string | null;
};

export type SecondaryId = "appetite" | "activity";

export type TrendSecondary = {
  id: SecondaryId;
  daysCounted: number;
  average: number | null;
  direction: "declining" | "rising" | "steady" | null;
  /** activity only: days they got out, out of daysCounted. */
  positiveDays: number | null;
  observationKey: string | null;
};

/**
 * Where the student began. Deliberately carries no instrument score or
 * severity band — those stay server-side for the counsellor.
 */
export type TrendStartingPoint = {
  since: string | null;
  baselineTaken: boolean;
  firstValues: Partial<Record<SeriesId, number>>;
};

export type TrendRhythm = {
  daysLogged: number;
  windowDays: number;
};

export type Trends = {
  range: TrendRange;
  checkInCount: number;
  hasEnoughData: boolean;
  series: TrendSeries[];
  secondary: TrendSecondary[];
  startingPoint: TrendStartingPoint | null;
  rhythm: TrendRhythm;
  summary: { insightKeys: string[]; tipKey: string | null };
};

export type TalkRole = "user" | "assistant";

/** A message in the student's one ongoing conversation with Companion. */
export type TalkMessage = {
  id: string;
  role: TalkRole;
  text: string;
  at: string;
  status: string;
};

export type TalkConversation = {
  /** Null when nothing has been sent yet. */
  id: string | null;
  messages: TalkMessage[];
};

/**
 * "3a" (crisis, no named method/plan/timeframe) or "3b" (imminent -- one of
 * those is present). Only meaningful alongside a tier-3 safety verdict; null
 * otherwise. Decided server-side by a deterministic gate, never guessed
 * client-side.
 */
export type Tier3Kind = "3a" | "3b" | null;

/** Emitted while POST /talk/messages streams back over SSE. */
export type TalkStreamEvent =
  | {
      type: "meta";
      conversationId: string;
      messageId: string;
      tier3Kind: Tier3Kind;
      /** Addresses the safety_assessments row for cancel/expire calls on a
       *  3b countdown. Null when there's no tier-3 verdict (the mock never
       *  produces one). */
      safetyAssessmentId: string | null;
    }
  | { type: "token"; text: string }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string };

/**
 * The tier-2 interstitial: "here's what we noticed" plus a concrete list of
 * what a release to a counsellor would include. `shareScope` is a fixed,
 * server-picked vocabulary (never freehand text) so the bullet list the
 * student sees is never vaguer than what's actually true.
 */
export type EscalationBrief = {
  id: string;
  reasonSummaryKey: string;
  shareScope: string[];
  createdAt: string;
};

export type AssessmentInstrument = "phq9" | "gad7" | "asrs_v1_1";
export type AssessmentAnswer = { itemId: string; value: number };
export type AssessmentResult = {
  instrument: AssessmentInstrument;
  score: number | null;
  maximum: number | null;
  band: string | null;
  positiveCount: number | null;
  requiresSafetyReview: boolean;
  completedAt: string;
};
