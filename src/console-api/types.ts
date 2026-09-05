/**
 * Wire shapes for the counsellor console. Deliberately not shared with
 * src/api/types.ts: these carry real internal detail (tier, tier3Kind,
 * message text) that never appears anywhere in the student-facing API --
 * see the G plan's Context for why the plain-language rule stops here.
 */

export type CounsellorOut = {
  id: string;
  email: string;
  name: string;
};

export type CaseType = "safety" | "escalation";

export type QueueItem = {
  caseType: CaseType;
  caseId: string;
  studentId: string;
  createdAt: string;
  /** Only meaningful for caseType === "safety". */
  tier3Kind: "3a" | "3b" | null;
  /** Only meaningful for caseType === "escalation" -- this window's mood
   *  average minus the previous window's. Negative is a decline. Null when
   *  there isn't enough check-in history to compute one. */
  change: number | null;
  /** Only meaningful for caseType === "escalation". */
  reasonSummaryKey: string | null;
};

export type ConsoleMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
  status: string;
};

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

export type SafetyCase = {
  caseId: string;
  studentId: string;
  createdAt: string;
  tier: number;
  tier3Kind: "3a" | "3b" | null;
  reasonCode: string;
  confidence: number | null;
  countdownStatus: string | null;
  messageText: string;
  contextMessages: ConsoleMessage[];
  crisisPlan: CrisisPlan | null;
  trustedContact: TrustedContact | null;
  reviewStatus: string;
  reviewedAt: string | null;
};

export type ConsoleCheckIn = {
  date: string;
  at: string;
  mood: number;
  sleepHours: number;
  note: string;
};

export type EscalationCase = {
  caseId: string;
  studentId: string;
  createdAt: string;
  firedBy: string;
  reasonSummaryKey: string;
  shareScope: string[];
  change: number | null;
  /** null -- not an empty array -- when "checkins" isn't in shareScope at
   *  all, so the UI can tell "not shared" apart from "shared, but empty". */
  checkIns: ConsoleCheckIn[] | null;
  messages: ConsoleMessage[] | null;
  counsellorReviewedAt: string | null;
};
