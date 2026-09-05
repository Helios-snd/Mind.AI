"use client";

import { useI18n } from "@/i18n";
import { useMeSummary } from "@/api/hooks";
import type { Keys } from "@/i18n/en";
import type { ScreeningInstrument } from "@/api/types";

// Never the raw instrument code, and never a score/band anywhere near it --
// see backend/app/modules/users/schemas.py. dass21 is the onboarding
// baseline -- every onboarded student has one, so it shows up in this list
// too, not just the instruments POST /screenings/complete produces.
const INSTRUMENT_LABEL_KEY: Record<ScreeningInstrument, Keys> = {
  phq9: "me.wellbeing.screenings.phq9",
  gad7: "me.wellbeing.screenings.gad7",
  asrs_v1_1: "me.wellbeing.screenings.asrsV11",
  dass21: "me.wellbeing.screenings.dass21",
};

/**
 * Safety + screening summary, plain language only. Never a tier number,
 * never "3a"/"3b", never a severity band or score -- matches the same rule
 * PHQ-9/GAD-7/DASS already follow everywhere else in this app.
 */
export function WellbeingSummary() {
  const { t, n, language } = useI18n();
  const summary = useMeSummary();

  if (summary.isPending) {
    return <p className="text-sm text-earth">{t("state.loading")}</p>;
  }

  if (summary.isError || !summary.data) {
    return <p className="text-sm text-earth">{t("state.error")}</p>;
  }

  const { safety, screenings } = summary.data;

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-IN", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm leading-relaxed text-earth">
          {safety.recentFlagCount > 0
            ? t("me.wellbeing.safety.flagged", { count: n(safety.recentFlagCount) })
            : t("me.wellbeing.safety.default")}
        </p>
        {safety.pendingReview && (
          <p className="mt-1.5 text-sm leading-relaxed text-earth">
            {t("me.wellbeing.safety.pendingReview")}
          </p>
        )}
      </div>

      <div className="border-t border-ink/[0.06] pt-3">
        {screenings.length === 0 ? (
          <p className="text-sm text-earth">{t("me.wellbeing.screenings.empty")}</p>
        ) : (
          <ul className="space-y-1.5">
            {screenings.map((item, index) => (
              <li key={`${item.instrument}-${item.completedAt}-${index}`} className="text-sm text-earth">
                {t("me.wellbeing.screenings.item", {
                  instrument: t(INSTRUMENT_LABEL_KEY[item.instrument]),
                  date: fmtDate(item.completedAt),
                })}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
