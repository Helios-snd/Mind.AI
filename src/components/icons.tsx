/**
 * Small functional UI icons — the app's own hand-drawn set (no icon library).
 * Convention: 24×24 viewBox, `currentColor` stroke, 1.6 weight, `aria-hidden`.
 * Size and color come from the caller via `className`.
 */

type IconProps = { className?: string };

function Svg({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Sun over a horizon — the daily check-in. */
export function TodayIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v2M12 18.5v2M4.2 12h2M17.8 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />
    </Svg>
  );
}

/** Speech bubble — the open conversation. */
export function TalkIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 12a7 7 0 0 1-7 7H8l-4 3v-4.6A7 7 0 0 1 4 12a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7Z" />
    </Svg>
  );
}

/** Axes with a rising line — the weekly trends. */
export function TrendsIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 4v15a1 1 0 0 0 1 1h15" />
      <path d="M7.5 14.5l3.5-4 3 2.5 4.5-6" />
    </Svg>
  );
}

/** Person — the profile tab. */
export function MeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 19.5c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </Svg>
  );
}
