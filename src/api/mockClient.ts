import type { ApiClient } from "./client";
import type {
  CheckIn,
  CheckInDraft,
  CrisisPlan,
  OnboardingProgress,
  TalkConversation,
  TalkMessage,
  TalkStreamEvent,
  TrendRange,
  Trends,
  TrustedContact,
  AssessmentAnswer,
  AssessmentInstrument,
  AssessmentResult,
} from "./types";

/**
 * In-memory mock. It is browser-only and persists a copy to localStorage so the
 * onboarding flow survives a page refresh at every step (an acceptance
 * requirement). Flip `mockClient.shouldFail = true` from the console to exercise
 * the error + retry states.
 */

const STORAGE_KEY = "aimind.onboarding.v1";
const CHECKIN_KEY = "aimind.today.v1";
const TALK_KEY = "aimind.talk.mock.v1";
const LATENCY_MS = 300;

let progress: OnboardingProgress = load();

function load(): OnboardingProgress {
  if (typeof window === "undefined") return { step: 1 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { step: 1 };
    const parsed = JSON.parse(raw) as OnboardingProgress;
    if (parsed && typeof parsed.step === "number") return parsed;
  } catch {
    // corrupt or unavailable storage — start fresh
  }
  return { step: 1 };
}

function loadCheckIns(): CheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHECKIN_KEY);
    return raw ? (JSON.parse(raw) as CheckIn[]) : [];
  } catch {
    return [];
  }
}

function persistCheckIns(entries: CheckIn[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHECKIN_KEY, JSON.stringify(entries));
  } catch {
    // storage blocked or full — the mock is a dev convenience, not durable
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage full or blocked — the in-memory copy still works this session
  }
}

function wait() {
  return new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));
}

function loadTalkConversation(): TalkConversation {
  if (typeof window === "undefined") return { id: null, messages: [] };
  try {
    const raw = window.localStorage.getItem(TALK_KEY);
    if (!raw) return { id: null, messages: [] };
    return JSON.parse(raw) as TalkConversation;
  } catch {
    return { id: null, messages: [] };
  }
}

function persistTalkConversation(conversation: TalkConversation) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TALK_KEY, JSON.stringify(conversation));
  } catch {
    // storage full or blocked — the mock is a dev convenience, not durable
  }
}

let mockTalkIdCounter = 0;
function mockTalkId(): string {
  mockTalkIdCounter += 1;
  return `mock-${Date.now()}-${mockTalkIdCounter}`;
}

async function guard() {
  await wait();
  if (mockClient.shouldFail) {
    throw new Error("mock: request failed");
  }
}

type MockClient = ApiClient & { shouldFail: boolean; _reset(): void };

export const mockClient: MockClient = {
  shouldFail: false,

  async getOnboardingProgress() {
    await guard();
    return structuredClone(progress);
  },

  async saveOnboardingStep(patch) {
    await guard();
    progress = { ...progress, ...patch };
    persist();
    return structuredClone(progress);
  },

  async completeOnboarding() {
    await guard();
    progress = { ...progress, completedAt: new Date().toISOString() };
    persist();
    return structuredClone(progress);
  },

  async getCrisisPlan(): Promise<CrisisPlan | null> {
    await guard();
    return progress.crisisPlan ? structuredClone(progress.crisisPlan) : null;
  },

  async getContact(): Promise<TrustedContact | null> {
    await guard();
    return progress.contact ? structuredClone(progress.contact) : null;
  },

  async saveCrisisPlan(plan) {
    await guard();
    progress = { ...progress, crisisPlan: plan };
    persist();
    return structuredClone(plan);
  },

  async saveContact(contact) {
    await guard();
    progress = { ...progress, contact };
    persist();
    return structuredClone(contact);
  },

  async deleteAllData() {
    await guard();
    mockClient._reset();
  },

  async listCheckIns() {
    await guard();
    return loadCheckIns().sort((a, b) => b.date.localeCompare(a.date));
  },

  async getCheckIn(date) {
    await guard();
    return loadCheckIns().find((c) => c.date === date) ?? null;
  },

  async saveCheckIn(draft) {
    await guard();
    // Same one-per-day rule the server enforces, so the two clients cannot
    // disagree about what a second submission means.
    const entry: CheckIn = {
      ...draft,
      at: new Date().toISOString(),
      reflection: { ackKey: "today.ack.goodMood", suggestion: null },
    };
    const rest = loadCheckIns().filter((c) => c.date !== draft.date);
    persistCheckIns([...rest, entry]);
    return entry;
  },

  async deleteCheckIn(date) {
    await guard();
    persistCheckIns(loadCheckIns().filter((c) => c.date !== date));
  },

  async getTrends(range: TrendRange): Promise<Trends> {
    await guard();
    // The mock does not recompute trends. Offline development gets an honest
    // empty state rather than a fabricated dashboard -- inventing a baseline
    // here is precisely the thing this slice removed from the real one.
    const entries = loadCheckIns();
    return {
      range,
      checkInCount: entries.length,
      hasEnoughData: false,
      series: (["mood", "sleep", "energy", "social"] as const).map((id) => ({
        id,
        points: [],
        average: null,
        current: null,
        high: null,
        low: null,
        change: null,
        baseline: null,
        direction: null,
        relation: null,
        observationKey: null,
        tipKey: null,
      })),
      secondary: [],
      startingPoint: null,
      rhythm: { daysLogged: 0, windowDays: { "7d": 7, "4w": 28, "6w": 42 }[range] },
      summary: { insightKeys: [], tipKey: null },
    };
  },

  async completeAssessment(instrument: AssessmentInstrument, answers: AssessmentAnswer[]): Promise<AssessmentResult> {
    await guard();
    const sensitive = instrument === "phq9" && answers.find((answer) => answer.itemId === "phq9-9")?.value;
    if (sensitive) return { instrument, score: null, maximum: null, band: null, positiveCount: null, requiresSafetyReview: true, completedAt: new Date().toISOString() };
    if (instrument === "asrs_v1_1") {
      const thresholds = [2, 2, 2, 3, 3, 3];
      const score = answers.filter((answer, index) => answer.value >= thresholds[index]).length;
      return { instrument, score, maximum: 6, positiveCount: score, band: score >= 4 ? "further evaluation may be worthwhile" : "screen did not reach the referral threshold", requiresSafetyReview: false, completedAt: new Date().toISOString() };
    }
    const score = answers.reduce((total, answer) => total + answer.value, 0);
    const bands: Array<[number, string]> = instrument === "phq9" ? [[4, "minimal"], [9, "mild"], [14, "moderate"], [19, "moderately severe"]] : [[4, "minimal"], [9, "mild"], [14, "moderate"]];
    const band = bands.find(([upper]) => score <= upper)?.[1] ?? "severe";
    return { instrument, score, maximum: instrument === "phq9" ? 27 : 21, band: String(band), positiveCount: null, requiresSafetyReview: false, completedAt: new Date().toISOString() };
  },

  async getConversation() {
    await guard();
    return structuredClone(loadTalkConversation());
  },

  async deleteConversation() {
    await guard();
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(TALK_KEY);
    } catch {
      // ignore
    }
  },

  // The real trigger is a server-side Trend computation over check-in
  // history (see backend/app/modules/escalations/service.py). The mock has
  // no equivalent, and inventing one here would mean fabricating an offer
  // of human support with nothing behind it -- so, like getTrends above, it
  // stays honestly empty rather than pretending.
  async getPendingEscalation() {
    await guard();
    return null;
  },

  async approveEscalation() {
    await guard();
  },

  async declineEscalation() {
    await guard();
  },

  // No tier-3 verdict is ever produced offline, so there is never a real
  // countdown to resolve -- these exist only to satisfy the interface.
  async cancelCountdown() {
    await guard();
  },

  async expireCountdown() {
    await guard();
  },

  _reset() {
    progress = { step: 1 };
    // Deliberately does NOT persist. The previous version re-wrote
    // aimind.onboarding.v1 immediately after wipeEverything() had deleted it,
    // so "delete everything" left a fresh record behind on disk.
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // storage blocked — the in-memory reset above still applies
      }
    }
  },
};

const OFFLINE_NOTICE =
  "[offline] Companion needs the Mind.AI backend running to reply for real — " +
  "set NEXT_PUBLIC_API_URL and start the server. This placeholder only " +
  "exists for frontend development without it.";

/**
 * Offline stand-in for `httpTalkStream`. Like `getTrends` above, it does not
 * fabricate an intelligent reply — it says plainly that the real Companion
 * isn't reachable, which is the honest thing to show in local dev with no
 * backend configured.
 */
export function mockTalkStream(
  text: string,
  conversationId: string | null,
  onEvent: (event: TalkStreamEvent) => void,
): { cancel: () => void } {
  let cancelled = false;

  (async () => {
    await wait();
    if (cancelled) return;

    if (mockClient.shouldFail) {
      onEvent({ type: "error", message: "mock: request failed" });
      return;
    }

    const conversation = loadTalkConversation();
    if (conversation.id === null) conversation.id = conversationId ?? mockTalkId();

    const userMessage: TalkMessage = {
      id: mockTalkId(),
      role: "user",
      text,
      at: new Date().toISOString(),
      status: "completed",
    };
    conversation.messages.push(userMessage);

    onEvent({
      type: "meta",
      conversationId: conversation.id,
      messageId: userMessage.id,
      // The mock never runs Safety -- there is no tier-3 verdict to gate on.
      tier3Kind: null,
      safetyAssessmentId: null,
    });
    if (cancelled) return;

    onEvent({ type: "token", text: OFFLINE_NOTICE });
    if (cancelled) return;

    const assistantMessage: TalkMessage = {
      id: mockTalkId(),
      role: "assistant",
      text: OFFLINE_NOTICE,
      at: new Date().toISOString(),
      status: "completed",
    };
    conversation.messages.push(assistantMessage);
    persistTalkConversation(conversation);

    onEvent({ type: "done", messageId: assistantMessage.id });
  })();

  return {
    cancel: () => {
      cancelled = true;
    },
  };
}
