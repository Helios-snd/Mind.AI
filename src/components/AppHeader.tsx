/**
 * The heading block shared by the scrolling app tabs (Today / Trends / Me).
 * Talk keeps its own compact sticky header — chat pattern.
 */
export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="animate-fade-up">
      <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-sm leading-relaxed text-earth">{subtitle}</p>
      )}
    </header>
  );
}
