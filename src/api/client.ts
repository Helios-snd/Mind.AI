import type {
  CrisisPlan,
  OnboardingProgress,
  TrustedContact,
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
}
