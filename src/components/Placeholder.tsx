/**
 * Greybox placeholder standing in for illustrations / photos / logos —
 * swap these for real assets later.
 */
export default function Placeholder({
  label,
  className = "",
  ratio = "aspect-video",
  rounded = "rounded-xl",
}: {
  label: string;
  className?: string;
  ratio?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`placeholder-box ${ratio} ${rounded} flex items-center justify-center border border-dashed border-brand/30 ${className}`}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <span className="px-3 text-center text-xs font-semibold uppercase tracking-wide text-brand/70">
        {label}
      </span>
    </div>
  );
}
