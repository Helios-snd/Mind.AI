"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockClient, mockTalkStream } from "./mockClient";
import { httpClient, httpTalkStream } from "./httpClient";
import type {
  CheckInDraft,
  CrisisPlan,
  OnboardingProgress,
  TalkStreamEvent,
  TrendRange,
  TrustedContact,
} from "./types";

// The single swap point. With NEXT_PUBLIC_API_URL unset the whole app still
// runs offline against the mock, which keeps the mock honest.
const api = process.env.NEXT_PUBLIC_API_URL ? httpClient : mockClient;
const talkStreamImpl = process.env.NEXT_PUBLIC_API_URL
  ? httpTalkStream
  : mockTalkStream;

/** The selected client, for the few callers that need it outside a hook
 *  (account deletion). Everything else goes through the hooks below. */
export const apiClient = api;

export const queryKeys = {
  onboarding: ["onboarding"] as const,
  crisisPlan: ["crisisPlan"] as const,
  contact: ["contact"] as const,
  checkIns: ["checkIns"] as const,
  trends: ["trends"] as const,
  talk: ["talk"] as const,
  escalation: ["escalation"] as const,
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

/**
 * Check-in hooks.
 *
 * These are the first queries whose data the server owns and can change
 * independently, so unlike the onboarding hooks they invalidate rather than
 * only writing through the cache. The global staleTime: Infinity in
 * providers.tsx still holds for everything else — the Help Now sheet depends
 * on it — so invalidation is opted into here rather than turned on globally.
 */
export function useCheckIns() {
  return useQuery({
    queryKey: queryKeys.checkIns,
    queryFn: () => api.listCheckIns(),
  });
}

export function useSaveCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draft: CheckInDraft) => api.saveCheckIn(draft),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.checkIns });
      // Trends are derived from check-ins, so a new one makes them stale.
      qc.invalidateQueries({ queryKey: queryKeys.trends });
    },
  });
}

export function useDeleteCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => api.deleteCheckIn(date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.checkIns });
      qc.invalidateQueries({ queryKey: queryKeys.trends });
    },
  });
}

export function useTrends(range: TrendRange) {
  return useQuery({
    queryKey: [...queryKeys.trends, range],
    queryFn: () => api.getTrends(range),
  });
}

/**
 * Talk hooks.
 *
 * The conversation itself is a plain query — same pattern as check-ins.
 * Sending a message is not: the reply streams token by token over SSE, which
 * doesn't fit a mutation's single-resolved-value shape, so that's the
 * `streamTalkMessage` function below rather than a `useMutation`.
 */
export function useTalkConversation() {
  return useQuery({
    queryKey: queryKeys.talk,
    queryFn: () => api.getConversation(),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteConversation(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.talk }),
  });
}

export function streamTalkMessage(
  text: string,
  conversationId: string | null,
  onEvent: (event: TalkStreamEvent) => void,
): { cancel: () => void } {
  return talkStreamImpl(text, conversationId, onEvent);
}

/**
 * Escalation hooks — the tier-2 "here's what we noticed, here's what we'd
 * share" interstitial. The condition is computed server-side (Trend, not
 * Safety); the client only ever reads the current pending offer and records
 * the student's decision.
 */
export function useEscalation() {
  return useQuery({
    queryKey: queryKeys.escalation,
    queryFn: () => api.getPendingEscalation(),
  });
}

export function useApproveEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.approveEscalation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.escalation }),
  });
}

export function useDeclineEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.declineEscalation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.escalation }),
  });
}

/**
 * The tier-3b countdown. Both are fire-and-forget from CrisisScreen's point
 * of view — it already updated its own local state (stopped the timer)
 * before calling either of these; nothing here is read back into the UI.
 */
export function useCancelCountdown() {
  return useMutation({
    mutationFn: (safetyAssessmentId: string) =>
      api.cancelCountdown(safetyAssessmentId),
  });
}

export function useExpireCountdown() {
  return useMutation({
    mutationFn: (safetyAssessmentId: string) =>
      api.expireCountdown(safetyAssessmentId),
  });
}
