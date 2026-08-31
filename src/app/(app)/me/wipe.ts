import { mockClient } from "@/api/mockClient";

/**
 * Clears everything this device holds for the student — check-ins, conversation,
 * onboarding answers, plan and contact.
 *
 * TODO(backend): call the account-deletion endpoint; the server erases the
 * record and the referral history.
 */
export function wipeEverything() {
  if (typeof window === "undefined") return;
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("aimind."))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // storage blocked — the mock reset below still clears the session
  }
  mockClient._reset();
}
