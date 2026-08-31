"use client";

/**
 * Shared text inputs for the crisis-plan / trusted-contact forms. Used by
 * onboarding step 4 (`StepCrisisPlan`) and the Me tab controls, so the two stay
 * visually and behaviourally identical.
 */

export function fieldErrorId(id: string) {
  return `${id}-error`;
}

// Loose: allow spaces and hyphens, an optional +91 / 91, then ten digits.
export function phoneLooksValid(raw: string): boolean {
  const compact = raw.replace(/[\s-]/g, "");
  return /^(\+?91)?\d{10}$/.test(compact);
}

export function TextArea({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? fieldErrorId(id) : undefined}
        className="w-full rounded-lg border border-gray-300 p-3 text-sm"
      />
      {error && (
        <p id={fieldErrorId(id)} className="mt-1 text-sm text-brand-dark">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?: "tel";
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? fieldErrorId(id) : undefined}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      {error && (
        <p id={fieldErrorId(id)} className="mt-1 text-sm text-brand-dark">
          {error}
        </p>
      )}
    </div>
  );
}
