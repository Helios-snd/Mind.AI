"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { consoleApi } from "./client";

export const consoleQueryKeys = {
  me: ["console", "me"] as const,
  queue: ["console", "queue"] as const,
  safetyCase: (id: string) => ["console", "cases", "safety", id] as const,
  escalationCase: (id: string) => ["console", "cases", "escalation", id] as const,
};

export function useCounsellor() {
  return useQuery({
    queryKey: consoleQueryKeys.me,
    queryFn: () => consoleApi.me(),
    retry: false,
  });
}

export function useConsoleLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      consoleApi.login(email, password),
    onSuccess: (counsellor) => qc.setQueryData(consoleQueryKeys.me, counsellor),
  });
}

export function useConsoleLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => consoleApi.logout(),
    onSuccess: () => qc.clear(),
  });
}

export function useQueue() {
  return useQuery({
    queryKey: consoleQueryKeys.queue,
    queryFn: () => consoleApi.getQueue(),
  });
}

export function useSafetyCase(id: string) {
  return useQuery({
    queryKey: consoleQueryKeys.safetyCase(id),
    queryFn: () => consoleApi.getSafetyCase(id),
    enabled: !!id,
  });
}

export function useEscalationCase(id: string) {
  return useQuery({
    queryKey: consoleQueryKeys.escalationCase(id),
    queryFn: () => consoleApi.getEscalationCase(id),
    enabled: !!id,
  });
}

export function useReviewSafetyCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => consoleApi.reviewSafetyCase(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: consoleQueryKeys.queue }),
  });
}

export function useReviewEscalationCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => consoleApi.reviewEscalationCase(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: consoleQueryKeys.queue }),
  });
}
