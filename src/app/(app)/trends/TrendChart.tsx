"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { SERIES, type SeriesId, type WeekPoint } from "./data";

const W = 340;
const H = 176;
const PAD = { left: 18, right: 18, top: 12, bottom: 22 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

export function TrendChart({ weeks }: { weeks: WeekPoint[] }) {
  const { t, n, language } = useI18n();
  const [active, setActive] = useState<SeriesId>("mood");

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
  const fmtValue = (v: number) => (v % 1 === 0 ? n(v) : n(Math.round(v * 10) / 10));

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("trends.heading")}
        className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1"
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
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
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

        {/* the user's own usual range */}
        <rect
          x={PAD.left}
          y={Math.min(bandTop, bandBottom)}
          width={INNER_W}
          height={Math.abs(bandBottom - bandTop)}
          fill="#F0703A"
          fillOpacity={0.08}
        />
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={bandTop}
          y2={bandTop}
          stroke="#F0703A"
          strokeOpacity={0.25}
          strokeDasharray="3 3"
        />
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={bandBottom}
          y2={bandBottom}
          stroke="#F0703A"
          strokeOpacity={0.25}
          strokeDasharray="3 3"
        />

        <path
          d={linePath}
          fill="none"
          stroke="#F0703A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isLast ? 4 : 2.5}
              fill={isLast ? "#F0703A" : "#ffffff"}
              stroke="#F0703A"
              strokeWidth={1.5}
            />
          );
        })}

        {weeks.map((week, i) => (
          <text
            key={week.weekStart}
            x={xAt(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === count - 1 ? "end" : "middle"}
            fontSize={9}
            fill="#9ca3af"
          >
            {fmtDate(week.weekStart)}
          </text>
        ))}
      </svg>

      <p className="mt-2 text-sm text-gray-500">
        {t("trends.range", {
          low: fmtValue(meta.baseline[0]),
          high: fmtValue(meta.baseline[1]),
        })}{" "}
        · {t("trends.thisWeek", { value: fmtValue(latest) })}
      </p>
    </div>
  );
}
