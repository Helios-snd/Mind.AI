"use client";

import { isKey, useI18n } from "@/i18n";
import type { TrendRhythm, TrendSecondary } from "@/api/types";

/**
 * Closing summary of the dashboard: not "what do the numbers mean" (the
 * charts and notes above already answer that) but "what have I actually been
 * logging". Three columns, each a real count or a real reading -- never a
 * placeholder, never a fabricated day.
 */
export function CheckinSnapshot({
  rhythm,
  secondary,
}: {
  rhythm: TrendRhythm;
  secondary: TrendSecondary[];
}) {
  const { t } = useI18n();
  const activity = secondary.find((s) => s.id === "activity") ?? null;
  const appetite = secondary.find((s) => s.id === "appetite") ?? null;

  return (
    <section className="overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.06] via-cream-alt to-cream-alt">
      <div className="p-5 sm:p-6">
        <h2 className="font-display text-base font-semibold text-ink">
          {t("trends.snapshot.heading")}
        </h2>
        <p className="mt-1 text-sm text-earth">{t("trends.snapshot.sub")}</p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-brand/10 border-t border-brand/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <CheckinColumn icon={<CalendarIcon />} rhythm={rhythm} />
        <GettingOutColumn icon={<FootstepsIcon />} activity={activity} />
        <AppetiteColumn icon={<BowlIcon />} appetite={appetite} />
      </div>
    </section>
  );
}

function ColumnShell({
  icon,
  label,
  value,
  visual,
  caption,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  visual: React.ReactNode;
  caption: string;
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center gap-2 text-brand">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="mt-2.5 font-display text-2xl text-ink">{value}</p>
      <div className="mt-2.5">{visual}</div>
      <p className="mt-2.5 text-xs leading-relaxed text-earth">{caption}</p>
    </div>
  );
}

function CheckinColumn({
  icon,
  rhythm,
}: {
  icon: React.ReactNode;
  rhythm: TrendRhythm;
}) {
  const { t, n } = useI18n();
  return (
    <ColumnShell
      icon={icon}
      label={t("trends.snapshot.checkins.label")}
      value={t("trends.snapshot.checkins.value", {
        logged: n(rhythm.daysLogged),
        total: n(rhythm.windowDays),
      })}
      visual={<RatioVisual filled={rhythm.daysLogged} total={rhythm.windowDays} />}
      caption={t("trends.snapshot.checkins.caption", {
        logged: n(rhythm.daysLogged),
        total: n(rhythm.windowDays),
      })}
    />
  );
}

function GettingOutColumn({
  icon,
  activity,
}: {
  icon: React.ReactNode;
  activity: TrendSecondary | null;
}) {
  const { t, n } = useI18n();

  if (!activity || activity.daysCounted === 0 || activity.positiveDays === null) {
    return (
      <ColumnShell
        icon={icon}
        label={t("trends.snapshot.gettingOut.label")}
        value={t("trends.secondary.none")}
        visual={<RatioVisual filled={0} total={0} />}
        caption={t("trends.snapshot.gettingOut.noneCaption")}
      />
    );
  }

  return (
    <ColumnShell
      icon={icon}
      label={t("trends.snapshot.gettingOut.label")}
      value={t("trends.snapshot.gettingOut.value", {
        positive: n(activity.positiveDays),
        total: n(activity.daysCounted),
      })}
      visual={
        <RatioVisual filled={activity.positiveDays} total={activity.daysCounted} />
      }
      caption={t("trends.snapshot.gettingOut.caption", {
        positive: n(activity.positiveDays),
        total: n(activity.daysCounted),
      })}
    />
  );
}

function AppetiteColumn({
  icon,
  appetite,
}: {
  icon: React.ReactNode;
  appetite: TrendSecondary | null;
}) {
  const { t } = useI18n();

  const reading =
    appetite?.observationKey && isKey(appetite.observationKey)
      ? t(appetite.observationKey)
      : null;

  if (!reading) {
    return (
      <ColumnShell
        icon={icon}
        label={t("trends.snapshot.appetite.label")}
        value={t("trends.snapshot.appetite.none")}
        visual={<FlatLine />}
        caption={t("trends.snapshot.appetite.noneCaption")}
      />
    );
  }

  return (
    <ColumnShell
      icon={icon}
      label={t("trends.snapshot.appetite.label")}
      value={reading}
      visual={<FlatLine active />}
      caption={t("trends.snapshot.appetite.caption")}
    />
  );
}

/**
 * Dots for a small window (7-day range, or any total under 11), a
 * proportional bar once there are too many days to render individually
 * (4/6-week ranges). Either way the fill is exactly `filled / total` --
 * nothing here rounds up or invents a logged day.
 */
function RatioVisual({ filled, total }: { filled: number; total: number }) {
  if (total === 0) {
    return <div className="h-1.5 w-full rounded-full bg-ink/[0.06]" />;
  }

  if (total <= 10) {
    return (
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i < filled ? "bg-brand" : "bg-brand/15"
            }`}
          />
        ))}
      </div>
    );
  }

  const pct = Math.round((filled / total) * 100);
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.06]"
      aria-hidden="true"
    >
      <div
        className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function FlatLine({ active = false }: { active?: boolean }) {
  return (
    <div
      className={`h-1.5 w-full rounded-full ${active ? "bg-brand/40" : "bg-ink/[0.06]"}`}
      aria-hidden="true"
    />
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 13.5l2 2 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FootstepsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <ellipse cx="8.5" cy="7.5" rx="2" ry="3" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="15.5" cy="14.5" rx="2" ry="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 11v3M15.5 18v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BowlIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4 11.5h16a8 8 0 0 1-16 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 11.5V5M15 11.5V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 19.5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
