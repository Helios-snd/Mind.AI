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

export type MeProfile = {
  userId: string;
  language: Language;
  name: string | null;
  email: string | null;
  phone: string | null;
  claimed: boolean;
  onboarded: boolean;
};

/**
 * Wider than AssessmentInstrument: every onboarded student has a DASS-21
 * baseline session too, but that one is only ever created by onboarding,
 * never by POST /screenings/complete -- so it never appears on
 * AssessmentResult, only here, on the history/summary/export views.
 */
export type ScreeningInstrument = AssessmentInstrument | "dass21";

/**
 * A completed screening's date only -- never the score or band. Matches the
 * same "plain language, never a label" rule PHQ-9/GAD-7/DASS already follow
 * everywhere else in this app.
 */
export type ScreeningHistoryItem = {
  instrument: ScreeningInstrument;
  completedAt: string;
};

export type MeSummary = {
  safety: {
    /** Never a tier number -- just a count, for "our safety check runs on
     *  every message" style copy. */
    recentFlagCount: number;
    pendingReview: boolean;
  };
  screenings: ScreeningHistoryItem[];
};

export type ConsentEventItem = {
  kind: string;
  policyVersion: string;
  at: string;
};

/** The pieces of /data that MeSummary doesn't already cover. */
export type DataInventory = {
  signalsCount: number;
  consentEvents: ConsentEventItem[];
};

/** A past (approved/declined/expired) escalation -- /data's history section.
 *  Never the internal tier int or fired_by source, same "plain language
 *  only" rule as everything else derived from safety/escalation data. */
export type EscalationHistoryItem = {
  status: "approved" | "declined" | "expired";
  reasonSummaryKey: string;
  createdAt: string;
  resolvedAt: string | null;
};

export type ConversationExport = {
  messageCount: number;
  messages: TalkMessage[];
};

/**
 * GET /me/export's full shape. Follows the exact same plain-language rule
 * as every on-screen page: no score, no band, no tier -- see the F2 plan.
 * Everything else (conversation text, check-in notes, the crisis plan) is
 * included verbatim, since none of that was ever redacted in-app either.
 */
export type MeExport = {
  exportedAt: string;
  profile: MeProfile;
  onboarding: OnboardingProgress;
  consentEvents: ConsentEventItem[];
  checkIns: CheckIn[];
  signals: { kind: string; value: unknown; source: string; observedAt: string }[];
  safety: MeSummary["safety"];
  screenings: ScreeningHistoryItem[];
  conversation: ConversationExport;
  escalationHistory: EscalationHistoryItem[];
};
