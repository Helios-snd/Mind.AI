"use client";

import { useId, useState } from "react";
import { useI18n } from "@/i18n";
import { SERIES, type SeriesId, type WeekPoint } from "./data";

const BRAND = "#56663A";
const AXIS = "#9c9484";
const W = 340;
const H = 176;
const PAD = { left: 16, right: 16, top: 14, bottom: 24 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

export function TrendChart({ weeks }: { weeks: WeekPoint[] }) {
  const { t, n, language } = useI18n();
  const [active, setActive] = useState<SeriesId>("mood");
  const gradientId = useId();

  const meta = SERIES.find((s) => s.id === active)!;
  const count = weeks.length;

  const xAt = (i: number) =>
    PAD.left + (count === 1 ? INNER_W / 2 : (i / (count - 1)) * INNER_W);
  const yAt = (value: number) =>
    PAD.top +
    INNER_H -
    ((value - meta.min) / (meta.max - meta.min)) * INNER_H;

  const points = weeks.map((week, i) => ({ x: xAt(i), y: yAt(week[active]) }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)} ${(
    PAD.top + INNER_H
  ).toFixed(1)} L${points[0].x.toFixed(1)} ${(PAD.top + INNER_H).toFixed(1)} Z`;

  const bandTop = yAt(meta.baseline[1]);
  const bandBottom = yAt(meta.baseline[0]);

  const fmtDate = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-IN", {
      day: "numeric",
      month: "short",
    }).format(new Date(y, m - 1, d));
  };

  const latest = weeks[weeks.length - 1][active];
  const fmtValue = (v: number) =>
    v % 1 === 0 ? n(v) : n(Math.round(v * 10) / 10);

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("trends.heading")}
        className="mb-4 flex gap-1 rounded-xl bg-ink/[0.04] p-1"
      >
        {SERIES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={active === s.id}
            onClick={() => setActive(s.id)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
              active === s.id
                ? "bg-cream-alt text-ink shadow-soft"
                : "text-earth/70 hover:text-earth"
            }`}
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={t("trends.chartLabel", {
          series: t(meta.labelKey),
          weeks: n(count),
        })}
      >
        <title>
          {t("trends.chartLabel", { series: t(meta.labelKey), weeks: n(count) })}
        </title>

        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity="0.16" />
            <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* the user's own usual range */}
        <rect
          x={PAD.left}
          y={Math.min(bandTop, bandBottom)}
          width={INNER_W}
          height={Math.abs(bandBottom - bandTop)}
          fill={BRAND}
          fillOpacity={0.07}
          rx={4}
        />
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={bandTop}
          y2={bandTop}
          stroke={BRAND}
          strokeOpacity={0.22}
          strokeDasharray="2 4"
          strokeLinecap="round"
        />
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={bandBottom}
          y2={bandBottom}
          stroke={BRAND}
          strokeOpacity={0.22}
          strokeDasharray="2 4"
          strokeLinecap="round"
        />

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={BRAND}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return isLast ? (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={7} fill={BRAND} fillOpacity={0.14} />
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={BRAND}
                stroke="#FCF8EE"
                strokeWidth={2}
              />
            </g>
          ) : (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={2.6}
              fill="#FCF8EE"
              stroke={BRAND}
              strokeWidth={1.6}
            />
          );
        })}

        {weeks.map((week, i) => (
          <text
            key={week.weekStart}
            x={xAt(i)}
            y={H - 7}
            textAnchor={i === 0 ? "start" : i === count - 1 ? "end" : "middle"}
            fontSize={9}
            fontWeight={500}
            fill={AXIS}
          >
            {fmtDate(week.weekStart)}
          </text>
        ))}
      </svg>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-earth">
        <span>
          {t("trends.range", {
            low: fmtValue(meta.baseline[0]),
            high: fmtValue(meta.baseline[1]),
          })}
        </span>
        <span aria-hidden className="text-earth/40">
          ·
        </span>
        <span className="font-semibold text-ink">
          {t("trends.thisWeek", { value: fmtValue(latest) })}
        </span>
      </p>
    </div>
  );
}
