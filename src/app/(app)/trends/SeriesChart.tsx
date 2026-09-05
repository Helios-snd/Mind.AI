"use client";

import { useEffect, useId, useState } from "react";
import { useI18n } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import type { TrendBaseline, TrendPoint } from "@/api/types";

/**
 * One series, drawn against the student's own baseline band.
 *
 * Two things this deliberately does not do:
 *
 *   * It does not connect across missing days. A gap in the data is a gap in
 *     what the student told us, and a straight line through it invents a
 *     trajectory they never reported.
 *   * It does not draw a baseline band that was not supplied. No band means
 *     there is not yet enough history to call anything "usual".
 *
 * Colours come from CSS custom properties resolved off the element, so the
 * chart follows the design tokens instead of carrying its own copy of them --
 * an earlier version hardcoded the pre-rebrand olive and silently drifted.
 */

const W = 480;
const H_FULL = 220;
// Two check-ins don't need the same vertical reach as a real time series --
// a tall chart around two dots reads as broken, not sparse.
const H_COMPACT = 150;
const PAD = { left: 34, right: 14, top: 18, bottom: 28 };

/** Days beyond which two readings are not a continuous line. */
const MAX_GAP_DAYS = 2;

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000,
  );
}

export function SeriesChart({
  points,
  baseline,
  min,
  max,
  label,
  weekly = false,
  compact = false,
  referenceValue = null,
  referenceLabel,
  formatValue = (value) => String(value),
}: {
  points: TrendPoint[];
  baseline: TrendBaseline | null;
  min: number;
  max: number;
  label: string;
  weekly?: boolean;
  /** Shorter chart, coarser axis -- for the 2-point tier. */
  compact?: boolean;
  /** The student's own earliest-week average for this series, drawn as a
   *  reference distinct from both the data line and the IQR baseline band. */
  referenceValue?: number | null;
  referenceLabel?: string;
  /** Renders a value for the y-axis and the hover tooltip (e.g. "6 hrs"). */
  formatValue?: (value: number) => string;
}) {
  const gradientId = useId();
  const { language } = useI18n();
  const reduced = usePrefersReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    // One frame later, so the dash offset has an initial value to animate from.
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [points]);

  if (points.length === 0) return null;

  const H = compact ? H_COMPACT : H_FULL;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (index: number) =>
    points.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (index / (points.length - 1)) * innerW;

  const y = (value: number) => {
    const clamped = Math.min(max, Math.max(min, value));
    return PAD.top + innerH - ((clamped - min) / (max - min)) * innerH;
  };

  // Break the path wherever the student skipped days. Weekly buckets are
  // contiguous by construction, so only daily ranges can gap.
  const gapLimit = weekly ? Infinity : MAX_GAP_DAYS;
  const segments: { index: number; point: TrendPoint }[][] = [];
  points.forEach((point, index) => {
    const previous = points[index - 1];
    const isBreak =
      !previous || daysBetween(previous.at, point.at) > gapLimit;
    if (isBreak) segments.push([]);
    segments[segments.length - 1].push({ index, point });
  });

  const pathFor = (segment: { index: number; point: TrendPoint }[]) =>
    segment
      .map(
        ({ index, point }, i) =>
          `${i === 0 ? "M" : "L"} ${x(index)} ${y(point.value)}`,
      )
      .join(" ");

  const fmtDate = (iso: string, short = false) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-IN", {
      day: "numeric",
      month: short ? undefined : "short",
    }).format(new Date(iso));

  const tickEvery = Math.max(1, Math.ceil(points.length / 4));

  // The domain floor and ceiling, fixed to the series' own scale (e.g. 1-5,
  // 0-12h) rather than the data's range, so the axis reads the same
  // regardless of how tight this window's values are. The full chart adds a
  // midpoint; the compact one skips it -- a third label has no room to
  // breathe in 150px and starts to look like clutter rather than a scale.
  const yTicks = compact ? [max, min] : [max, (min + max) / 2, min];

  const clampedReference =
    referenceValue === null
      ? null
      : Math.min(max, Math.max(min, referenceValue));

  const hovered = active !== null ? points[active] : null;
  const tooltipX = active !== null ? x(active) : 0;
  const tooltipY = hovered ? y(hovered.value) : 0;
  // Flip the tooltip below the point once it's in the top third, so it never
  // renders off the top edge of the chart.
  const tooltipAbove = tooltipY > PAD.top + innerH * 0.28;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full text-brand"
        role="img"
        aria-label={label}
        style={{ maxHeight: 240 }}
        onMouseLeave={() => setActive(null)}
      >
        <title>{label}</title>

        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis: gridlines + labels on the series' own fixed scale. */}
        {yTicks.map((value, i) => (
          <g key={`y-${i}`}>
            <line
              x1={PAD.left}
              x2={PAD.left + innerW}
              y1={y(value)}
              y2={y(value)}
              stroke="currentColor"
              strokeWidth="1"
              opacity={i === 1 ? 0.1 : 0.14}
            />
            <text
              x={PAD.left - 8}
              y={y(value)}
              dy="0.32em"
              textAnchor="end"
              fontSize="9"
              className="fill-earth"
            >
              {formatValue(Math.round(value * 10) / 10)}
            </text>
          </g>
        ))}

        {baseline && (
          <>
            <rect
              x={PAD.left}
              y={y(baseline.high)}
              width={innerW}
              height={Math.max(1, y(baseline.low) - y(baseline.high))}
              fill="currentColor"
              opacity="0.08"
            />
            {[baseline.low, baseline.high].map((value) => (
              <line
                key={value}
                x1={PAD.left}
                x2={PAD.left + innerW}
                y1={y(value)}
                y2={y(value)}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 4"
                opacity="0.35"
              />
            ))}
          </>
        )}

        {/* The student's own starting point -- a dotted reference line, not a
            band, and a different dash pattern from the baseline above so the
            two are never mistaken for each other even in the same colour. */}
        {clampedReference !== null && (
          <g opacity="0.55">
            <line
              x1={PAD.left}
              x2={PAD.left + innerW}
              y1={y(clampedReference)}
              y2={y(clampedReference)}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeDasharray="1 3.5"
              strokeLinecap="round"
            />
            {referenceLabel && (
              <text
                x={PAD.left + innerW}
                y={y(clampedReference)}
                dy="-4"
                textAnchor="end"
                fontSize="8.5"
                fontWeight="600"
                className="fill-earth"
              >
                {referenceLabel}
              </text>
            )}
          </g>
        )}

        {segments.map((segment, i) => {
          if (segment.length === 1) return null;
          const d = pathFor(segment);
          const area = `${d} L ${x(segment[segment.length - 1].index)} ${
            PAD.top + innerH
          } L ${x(segment[0].index)} ${PAD.top + innerH} Z`;
          return (
            <g key={`seg-${i}`}>
              <path d={area} fill={`url(#${gradientId})`} />
              <path
                d={d}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                // Draw-on, unless the viewer asked for less movement.
                style={
                  reduced
                    ? undefined
                    : {
                        strokeDasharray: 800,
                        strokeDashoffset: drawn ? 0 : 800,
                        transition: "stroke-dashoffset 900ms ease-out",
                      }
                }
              />
            </g>
          );
        })}

        {/* Wide, invisible hit targets -- easier to hover/tap than the 2.5px
            dot itself, especially on a touch screen. */}
        {points.map((point, index) => (
          <rect
            key={`hit-${point.at}`}
            x={x(index) - innerW / Math.max(points.length, 1) / 2}
            y={PAD.top}
            width={innerW / Math.max(points.length, 1)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            tabIndex={0}
            role="button"
            aria-label={`${fmtDate(point.at)}: ${formatValue(point.value)}`}
          />
        ))}

        {points.map((point, index) => {
          const isLast = index === points.length - 1;
          const isActive = active === index;
          return (
            <circle
              key={point.at}
              cx={x(index)}
              cy={y(point.value)}
              r={isActive ? 5 : isLast ? 4 : 2.5}
              fill={
                isLast || isActive
                  ? "currentColor"
                  : "var(--chart-surface, #fff)"
              }
              stroke="currentColor"
              strokeWidth={isLast || isActive ? 2.5 : 1.5}
              pointerEvents="none"
            />
          );
        })}

        {points.map((point, index) =>
          index % tickEvery === 0 || index === points.length - 1 ? (
            <text
              key={`t-${point.at}`}
              x={x(index)}
              y={H - 8}
              textAnchor="middle"
              fontSize="9"
              className="fill-earth"
            >
              {fmtDate(point.at)}
            </text>
          ) : null,
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-white shadow-soft"
          style={{
            left: `${(tooltipX / W) * 100}%`,
            top: `${(tooltipY / H) * 100}%`,
            transform: `translate(-50%, ${tooltipAbove ? "-130%" : "18%"})`,
          }}
        >
          <div className="font-display text-sm">{formatValue(hovered.value)}</div>
          <div className="font-normal text-white/70">{fmtDate(hovered.at)}</div>
        </div>
      )}
    </div>
  );
}
