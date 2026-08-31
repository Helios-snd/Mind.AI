"use client";

import { useT } from "@/i18n";

/**
 * The three non-success states every async surface in onboarding shows.
 * (The fourth, success, is the screen itself.)
 */

export function OnboardingLoading() {
  const t = useT();
  return (
    <p role="status" className="text-gray-600">
      {t("state.loading")}
    </p>
  );
}

export function OnboardingEmpty() {
  const t = useT();
  return <p className="text-gray-600">{t("state.empty")}</p>;
}

export function OnboardingError({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div className="space-y-3" role="alert">
      <p className="text-gray-700">{t("state.error")}</p>
      <button type="button" onClick={onRetry} className="btn-outline">
        {t("action.retry")}
      </button>
    </div>
  );
}

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x flex min-h-[70vh] max-w-xl flex-col justify-center py-12">
      {children}
    </div>
  );
}
