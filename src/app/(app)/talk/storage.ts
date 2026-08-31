/**
 * Local persistence for the Talk thread.
 *
 * Frontend-only: the conversation lives in localStorage so it survives a
 * refresh and "remembers previous conversations" across visits.
 *
 * TODO(backend): replace load/save with the COMPANION thread endpoints. SAFETY
 * reads every inbound message server-side and may inject a crisis interstitial.
 */

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  at: string;
  /** User messages only. Absent once delivered. */
  status?: "sending" | "failed";
};

const THREAD_KEY = "aimind.talk.thread.v1";
const DISCLOSURE_KEY = "aimind.talk.disclosureSeen.v1";

export function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function localDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadThread(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(THREAD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // A message caught mid-send by a refresh is treated as failed.
    return parsed.filter(isMessage).map((m) =>
      m.status === "sending" ? { ...m, status: "failed" as const } : m,
    );
  } catch {
    return [];
  }
}

export function saveThread(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THREAD_KEY, JSON.stringify(messages));
  } catch {
    // storage full or blocked — in-memory state still holds this session
  }
}

/** Wipe the whole conversation. */
export function clearThread(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(THREAD_KEY);
  } catch {
    // ignore
  }
}

export function disclosureSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(DISCLOSURE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markDisclosureSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISCLOSURE_KEY, "1");
  } catch {
    // ignore
  }
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    (v.role === "user" || v.role === "assistant") &&
    typeof v.text === "string" &&
    typeof v.at === "string"
  );
}
