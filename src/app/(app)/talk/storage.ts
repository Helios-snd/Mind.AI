/**
 * Talk-local helpers that stay frontend-only even now that the conversation
 * itself is server-backed (see useTalkThread.ts).
 *
 * ChatMessage is the UI's own shape rather than the wire TalkMessage from
 * @/api/types: `status` here tracks an in-flight optimistic send ("sending",
 * "failed") that the server never sees, not the persisted delivery status.
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
