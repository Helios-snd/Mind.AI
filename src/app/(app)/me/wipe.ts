import { apiClient } from "@/api/hooks";

/**
 * Erases the account.
 *
 * With a backend configured this calls the deletion endpoint, which removes
 * every row and clears the session cookie. The localStorage sweep still runs
 * because check-ins and the conversation thread are device-local until their
 * own slices land.
 */
export async function wipeEverything() {
  if (typeof window === "undefined") return;

  // Server first: if it fails we want the error to surface rather than leaving
  // a live account behind a cleared device.
  await apiClient.deleteAllData();

  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("aimind."))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // storage blocked — the account is already gone server-side
  }
}
