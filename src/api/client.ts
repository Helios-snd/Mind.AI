import type {
  CheckIn,
  CheckInDraft,
  CrisisPlan,
  DataInventory,
  EscalationBrief,
  EscalationHistoryItem,
  MeExport,
  MeProfile,
  MeSummary,
  OnboardingProgress,
  TalkConversation,
  TrendRange,
  Trends,
  TrustedContact,
  AssessmentAnswer,
  AssessmentInstrument,
  AssessmentResult,
} from "./types";

/**
 * The single API surface the app talks to. Only mockClient implements it today;
 * a real HTTP client would slot in here without any component changing.
 *
 * No component calls fetch or the client directly — everything goes through the
 * TanStack Query hooks in ./hooks.
 */
export interface ApiClient {
  getOnboardingProgress(): Promise<OnboardingProgress>;
  saveOnboardingStep(
    patch: Partial<OnboardingProgress>,
  ): Promise<OnboardingProgress>;
  completeOnboarding(): Promise<OnboardingProgress>;
  getCrisisPlan(): Promise<CrisisPlan | null>;
  getContact(): Promise<TrustedContact | null>;
  saveCrisisPlan(plan: CrisisPlan): Promise<CrisisPlan>;
  saveContact(contact: TrustedContact): Promise<TrustedContact>;
  /** Erases the account. Closes the leak where wipe.ts reached past this
   *  interface to call mockClient._reset() directly. */
  deleteAllData(): Promise<void>;

  listCheckIns(): Promise<CheckIn[]>;
  /** Null when nothing was logged that day. */
  getCheckIn(date: string): Promise<CheckIn | null>;
  /** Creates, or replaces the existing check-in for the same local day. */
  saveCheckIn(draft: CheckInDraft): Promise<CheckIn>;
  deleteCheckIn(date: string): Promise<void>;

  getTrends(range: TrendRange): Promise<Trends>;
  completeAssessment(instrument: AssessmentInstrument, answers: AssessmentAnswer[]): Promise<AssessmentResult>;

  /** The student's single ongoing conversation with Companion. */
  getConversation(): Promise<TalkConversation>;
  deleteConversation(): Promise<void>;
  /** Sending a message streams the reply over SSE, so it doesn't fit this
   *  Promise-returning shape — see `streamTalkMessage` in ./hooks. */

  /** The student's one pending tier-2 offer of human support, or null. */
  getPendingEscalation(): Promise<EscalationBrief | null>;
  approveEscalation(id: string): Promise<void>;
  declineEscalation(id: string): Promise<void>;
  /** F3: the student asking directly, from /human's "Request support"
   *  button -- not a risk signal. Reuses the same pending → approve
   *  lifecycle as every other escalation; the id comes back through the
   *  usual getPendingEscalation() poll, not this call's own response. */
  requestSupport(): Promise<void>;

  /** The tier-3b countdown: recorded as a fact, never a real contact send
   *  (see backend/app/modules/talk/service.py::resolve_countdown). */
  cancelCountdown(safetyAssessmentId: string): Promise<void>;
  expireCountdown(safetyAssessmentId: string): Promise<void>;

  /** Real account identity — see /me/page.tsx. */
  getMe(): Promise<MeProfile>;
  /** Plain-language safety/screening summary, never a tier or a band. */
  getMeSummary(): Promise<MeSummary>;

  /** The rest of /data: signals count + the full consent audit trail. */
  getDataInventory(): Promise<DataInventory>;
  /** Past (non-pending) escalations — /data's history section. */
  getEscalationHistory(): Promise<EscalationHistoryItem[]>;
  /** A full, backend-assembled copy of everything stored — same
   *  plain-language rule as every on-screen page. */
  exportMyData(): Promise<MeExport>;
}
