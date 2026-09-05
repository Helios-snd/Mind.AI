"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useT } from "@/i18n";
import { useContact, useCrisisPlan } from "@/api/hooks";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type View = "list" | "compose" | "plan" | "calming";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';

export default function HelpNowSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const headingId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<View>("list");

  // No loading gate anywhere in here — rows render immediately and names fill
  // in when the cache resolves.
  const contact = useContact();
  const plan = useCrisisPlan();

  const contactResolved = contact.isSuccess || contact.isError;
  const hasContact = !!contact.data;

  // --- focus management -----------------------------------------------------
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const first = node.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node).focus();
  }, [view]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const node = dialogRef.current;
      if (!node) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  // --- actions -------------------------------------------------------------
  // Stays inside the sheet rather than leaving for /talk -- the student
  // should never have to exit the safety/support context to be calmed down.
  const stayWithMe = useCallback(() => {
    setView("calming");
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        aria-label={t("action.close")}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-gray-900/50"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id={headingId}
            className="font-display text-xl font-semibold text-gray-900"
          >
            {t("help.heading")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            {t("action.close")}
          </button>
        </div>

        {view === "list" && (
          <ul className="space-y-3">
            <li>
              <a
                href="tel:14416"
                className="block rounded-xl border border-gray-200 p-4 hover:border-brand/40 hover:bg-cream"
              >
                <Row
                  title={t("help.telemanas.title")}
                  subtitle={t("help.telemanas.subtitle")}
                />
              </a>
            </li>

            <li>
              {contactResolved && !hasContact ? (
                <button
                  type="button"
                  disabled
                  className="block w-full rounded-xl border border-gray-200 p-4 text-left opacity-60"
                >
                  <Row
                    title={t("help.contact.titleUnnamed")}
                    subtitle={t("help.contact.disabledSubtitle")}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setView("compose")}
                  className="block w-full rounded-xl border border-gray-200 p-4 text-left hover:border-brand/40 hover:bg-cream"
                >
                  <Row
                    title={
                      contact.data?.name
                        ? t("help.contact.title", { name: contact.data.name })
                        : t("help.contact.titleUnnamed")
                    }
                    subtitle={t("help.contact.subtitle")}
                  />
                </button>
              )}
            </li>

            <li>
              <button
                type="button"
                onClick={() => setView("plan")}
                className="block w-full rounded-xl border border-gray-200 p-4 text-left hover:border-brand/40 hover:bg-cream"
              >
                <Row
                  title={t("help.plan.title")}
                  subtitle={t("help.plan.subtitle")}
                />
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={stayWithMe}
                className="block w-full rounded-xl border border-gray-200 p-4 text-left hover:border-brand/40 hover:bg-cream"
              >
                <Row
                  title={t("help.stay.title")}
                  subtitle={t("help.stay.subtitle")}
                />
              </button>
            </li>
          </ul>
        )}

        {view === "compose" && (
          <ComposeView
            phone={contact.data?.phone ?? ""}
            onBack={() => setView("list")}
          />
        )}

        {view === "plan" && (
          <PlanView
            plan={plan.data ?? null}
            onBack={() => setView("list")}
          />
        )}

        {view === "calming" && (
          <CalmingView onBack={() => setView("list")} />
        )}
      </div>
    </div>
  );
}

function Row({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <span className="block font-semibold text-gray-900">{title}</span>
      <span className="mt-0.5 block text-sm text-gray-600">{subtitle}</span>
    </>
  );
}

function ComposeView({
  phone,
  onBack,
}: {
  phone: string;
  onBack: () => void;
}) {
  const t = useT();
  const fieldId = useId();
  const [text, setText] = useState(() => t("help.contact.prefill"));
  const [copied, setCopied] = useState(false);

  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const smsHref = useMemo(() => {
    const body = encodeURIComponent(text);
    return phone ? `sms:${phone}?body=${body}` : `sms:?body=${body}`;
  }, [phone, text]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-brand"
      >
        {t("action.back")}
      </button>

      <div>
        <label
          htmlFor={fieldId}
          className="mb-1 block text-sm font-semibold text-gray-700"
        >
          {t("help.contact.messageLabel")}
        </label>
        <textarea
          id={fieldId}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setCopied(false);
          }}
          rows={4}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {canShare ? (
          <button
            type="button"
            onClick={() => {
              navigator.share({ text }).catch(() => {});
            }}
            className="btn-primary"
          >
            {t("help.contact.send")}
          </button>
        ) : (
          <a href={smsHref} className="btn-primary">
            {t("help.contact.send")}
          </a>
        )}

        <button type="button" onClick={copy} className="btn-outline">
          {copied ? t("help.contact.copied") : t("help.contact.copy")}
        </button>
      </div>
    </div>
  );
}

function PlanView({
  plan,
  onBack,
}: {
  plan: {
    whoIdCall: string;
    whatHelps: string;
    whatMakesItWorse: string;
  } | null;
  onBack: () => void;
}) {
  const t = useT();

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-brand"
      >
        {t("action.back")}
      </button>

      {!plan ? (
        <p className="text-sm text-gray-600">{t("help.plan.empty")}</p>
      ) : (
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-semibold text-gray-700">
              {t("onboarding.crisis.q1.label")}
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {plan.whoIdCall}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-700">
              {t("onboarding.crisis.q2.label")}
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {plan.whatHelps}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-700">
              {t("onboarding.crisis.q3.label")}
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {plan.whatMakesItWorse}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}

/**
 * The destination for "Just stay with me" — a short breathing/grounding
 * exercise, kept inside the sheet so the student never has to leave the
 * safety/support context to be calmed down. No scoring, no interpretation,
 * no inferred emotional state: just the steps.
 */
function CalmingView({ onBack }: { onBack: () => void }) {
  const t = useT();
  const reduced = usePrefersReducedMotion();

  return (
    <div className="space-y-5">
      <p className="font-display text-lg font-semibold text-gray-900">
        {t("help.stay.title")}
      </p>
      <p className="text-sm leading-relaxed text-gray-700">
        {t("help.calming.intro")}
      </p>

      <div className="flex justify-center py-2">
        <div
          aria-hidden="true"
          className={`h-20 w-20 rounded-full bg-brand/20 ${
            reduced ? "" : "animate-breathe"
          }`}
        />
      </div>

      <ol className="space-y-2.5">
        {(["help.calming.inhale", "help.calming.hold", "help.calming.exhale"] as const).map(
          (key) => (
            <li
              key={key}
              className="rounded-xl border border-gray-200 bg-cream px-4 py-3 text-sm font-semibold text-gray-900"
            >
              {t(key)}
            </li>
          ),
        )}
      </ol>

      <p className="text-sm leading-relaxed text-gray-700">
        {t("help.calming.repeat")}
      </p>

      <p className="text-sm leading-relaxed text-gray-600">
        {t("help.calming.grounding")}
      </p>

      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-brand"
      >
        {t("help.calming.back")}
      </button>
    </div>
  );
}
