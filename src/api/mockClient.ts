import type { ApiClient } from "./client";
import type { CrisisPlan, OnboardingProgress, TrustedContact } from "./types";

/**
 * In-memory mock. It is browser-only and persists a copy to localStorage so the
 * onboarding flow survives a page refresh at every step (an acceptance
 * requirement). Flip `mockClient.shouldFail = true` from the console to exercise
 * the error + retry states.
 */

const STORAGE_KEY = "aimind.onboarding.v1";
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

  _reset() {
    progress = { step: 1 };
    persist();
  },
};
