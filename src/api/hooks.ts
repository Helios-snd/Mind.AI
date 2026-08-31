"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockClient } from "./mockClient";
import type { CrisisPlan, OnboardingProgress, TrustedContact } from "./types";

const api = mockClient;

export const queryKeys = {
  onboarding: ["onboarding"] as const,
  crisisPlan: ["crisisPlan"] as const,
  contact: ["contact"] as const,
};

export function useOnboardingProgress() {
  return useQuery({
    queryKey: queryKeys.onboarding,
    queryFn: () => api.getOnboardingProgress(),
  });
}

export function useSaveOnboardingStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<OnboardingProgress>) =>
      api.saveOnboardingStep(patch),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.onboarding, data);
      // Keep the plan / contact caches aligned when step 4 saves them.
      if (data.crisisPlan) qc.setQueryData(queryKeys.crisisPlan, data.crisisPlan);
      if (data.contact) qc.setQueryData(queryKeys.contact, data.contact);
    },
  });
}

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.completeOnboarding(),
    onSuccess: (data) => qc.setQueryData(queryKeys.onboarding, data),
  });
}

export function useCrisisPlan() {
  return useQuery({
    queryKey: queryKeys.crisisPlan,
    queryFn: () => api.getCrisisPlan(),
  });
}

export function useContact() {
  return useQuery({
    queryKey: queryKeys.contact,
    queryFn: () => api.getContact(),
  });
}

export function useSaveCrisisPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: CrisisPlan) => api.saveCrisisPlan(plan),
    onSuccess: (plan) => {
      qc.setQueryData(queryKeys.crisisPlan, plan);
      qc.setQueryData<OnboardingProgress>(queryKeys.onboarding, (prev) =>
        prev ? { ...prev, crisisPlan: plan } : prev,
      );
    },
  });
}

export function useSaveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contact: TrustedContact) => api.saveContact(contact),
    onSuccess: (contact) => {
      qc.setQueryData(queryKeys.contact, contact);
      qc.setQueryData<OnboardingProgress>(queryKeys.onboarding, (prev) =>
        prev ? { ...prev, contact } : prev,
      );
    },
  });
}
