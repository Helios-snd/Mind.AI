"use client";

import { useT, useLanguage } from "@/i18n";
import type { Language } from "@/api/types";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "bn", label: "বাংলা" },
];

export function LanguageControl() {
  const t = useT();
  const { language, setLanguage, isSaving } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const active = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={isSaving}
            aria-pressed={active}
            onClick={() => setLanguage(option.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "border-brand bg-brand text-white"
                : "border-gray-300 text-gray-700 hover:border-brand/40"
            }`}
          >
            {option.label}
          </button>
        );
      })}
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-400">
        हिन्दी
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {t("me.language.hindiSoon")}
        </span>
      </span>
    </div>
  );
}
