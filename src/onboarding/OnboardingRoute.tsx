"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCompleteOnboarding,
  useOnboardingProgress,
  useSaveOnboardingStep,
} from "@/api/hooks";
import { useHelpNowGate } from "@/help/HelpNowGate";
import type { BaselineAnswer, OnboardingStep } from "@/api/types";
import {
  OnboardingError,
  OnboardingLoading,
  OnboardingShell,
} from "./states";
import StepLanguage from "./StepLanguage";
import StepBaseline from "./StepBaseline";
import StepConsent from "./StepConsent";
import StepCrisisPlan from "./StepCrisisPlan";
import StepClaim from "./StepClaim";
import StepProgress from "./StepProgress";

export default function OnboardingRoute() {
  const router = useRouter();
  const progress = useOnboardingProgress();
  const save = useSaveOnboardingStep();
  const complete = useCompleteOnboarding();
  const { setVisible } = useHelpNowGate();

  // Local step pointer. Seeded from the saved step once, then user-driven so
  // Back works without losing saved answers.
  const [step, setStep] = useState<OnboardingStep | null>(null);

  useEffect(() => {
    if (step === null && progress.data) setStep(progress.data.step);
  }, [step, progress.data]);

  // Already finished — send them on.
  useEffect(() => {
    if (progress.data?.completedAt) router.replace("/today");
  }, [progress.data?.completedAt, router]);

  // The Need Help Now button appears from step 3 onward.
  useEffect(() => {
    setVisible(step !== null && step >= 3);
    return () => setVisible(true);
  }, [step, setVisible]);

  if (progress.isLoading || step === null) {
    return (
      <OnboardingShell>
        <OnboardingLoading />
      </OnboardingShell>
    );
  }

  if (progress.isError) {
    return (
      <OnboardingShell>
        <OnboardingError onRetry={() => progress.refetch()} />
      </OnboardingShell>
    );
  }

  const data = progress.data;
  if (!data) {
    return (
      <OnboardingShell>
        <OnboardingLoading />
      </OnboardingShell>
    );
  }

  // Already finished. The redirect effect above is taking us to /today — show a
  // placeholder, never a pre-filled step, while it happens.
  if (data.completedAt) {
    return (
      <OnboardingShell>
        <OnboardingLoading />
      </OnboardingShell>
    );
  }

  const goTo = async (
    next: OnboardingStep,
    patch: Parameters<typeof save.mutateAsync>[0] = {},
  ) => {
    await save.mutateAsync({ step: next, ...patch });
    setStep(next);
  };

  const back = () =>
    setStep((current) =>
      current && current > 1 ? ((current - 1) as OnboardingStep) : current,
    );

  const saveBaseline = (baseline: BaselineAnswer[]) =>
    save.mutateAsync({ baseline });

  return (
    <OnboardingShell>
      <StepProgress step={step} />

      {step === 1 && (
        <StepLanguage
          busy={save.isPending}
          onChoose={(language) => goTo(2, { language })}
        />
      )}

      {step === 2 && (
        <StepBaseline
          existing={data.baseline ?? []}
          onSave={saveBaseline}
          onBack={back}
          onDone={() => goTo(3)}
        />
      )}

      {step === 3 && (
        <StepConsent
          busy={save.isPending}
          onBack={back}
          onAgree={() => goTo(4, { consentAt: new Date().toISOString() })}
        />
      )}

      {step === 4 && (
        <StepCrisisPlan
          busy={save.isPending}
          existingPlan={data.crisisPlan}
          existingContact={data.contact}
          onBack={back}
          onSubmit={async ({ crisisPlan, contact }) => {
            await save.mutateAsync({ crisisPlan, contact, step: 5 });
            setStep(5);
          }}
        />
      )}

      {step === 5 && (
        <StepClaim
          busy={complete.isPending}
          onDone={async () => {
            // Completion is stamped here, after the claim screen rather than
            // before it. Stamping at step 4 would trip the completedAt
            // redirect above and skip this step entirely, and a refresh would
            // land on /today instead of resuming here.
            await complete.mutateAsync();
            router.push("/today");
          }}
        />
      )}
    </OnboardingShell>
  );
}
