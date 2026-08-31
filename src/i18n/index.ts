"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { en, type Keys } from "./en";
import { bn } from "./bn";
import type { Language } from "@/api/types";
import { useOnboardingProgress, useSaveOnboardingStep } from "@/api/hooks";

const dictionaries: Record<Language, Record<Keys, string>> = { en, bn };

type Vars = Record<string, string | number>;

type I18nValue = {
  language: Language;
  setLanguage: (next: Language) => void;
  isSaving: boolean;
  t: (key: Keys, vars?: Vars) => string;
  /** Locale-aware number, so counts render as Bengali digits under bn. */
  n: (value: number) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const progress = useOnboardingProgress();
  const save = useSaveOnboardingStep();

  const language: Language = progress.data?.language ?? "en";

  const setLanguage = useCallback(
    (next: Language) => {
      save.mutate({ language: next });
    },
    [save],
  );

  const t = useCallback(
    (key: Keys, vars?: Vars) => interpolate(dictionaries[language][key], vars),
    [language],
  );

  const n = useCallback(
    (value: number) =>
      new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-IN").format(value),
    [language],
  );

  const value = useMemo<I18nValue>(
    () => ({ language, setLanguage, isSaving: save.isPending, t, n }),
    [language, setLanguage, save.isPending, t, n],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Convenience: just the translate function. */
export function useT() {
  return useI18n().t;
}

export function useLanguage() {
  const { language, setLanguage, isSaving } = useI18n();
  return { language, setLanguage, isSaving };
}
