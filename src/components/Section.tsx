export function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-12 sm:py-16 ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-8 ${center ? "text-center" : ""} max-w-2xl ${center ? "mx-auto" : ""}`}>
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">
          {eyebrow}
        </p>
      )}
      <h2 className="h-display text-3xl sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-gray-600">{subtitle}</p>}
    </div>
  );
}
