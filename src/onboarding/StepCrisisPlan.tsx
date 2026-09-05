"use client";

import { useId, useState } from "react";
import { useT } from "@/i18n";
import { TextArea, TextField, phoneLooksValid } from "@/components/formFields";
import type { CrisisPlan, TrustedContact } from "@/api/types";

type Fields = {
  whoIdCall: string;
  whatHelps: string;
  whatMakesItWorse: string;
  name: string;
  relationship: string;
  phone: string;
};

const EMPTY: Fields = {
  whoIdCall: "",
  whatHelps: "",
  whatMakesItWorse: "",
  name: "",
  relationship: "",
  phone: "",
};

export default function StepCrisisPlan({
  existingPlan,
  existingContact,
  onBack,
  onSubmit,
  busy,
}: {
  existingPlan?: CrisisPlan;
  existingContact?: TrustedContact;
  onBack: () => void;
  onSubmit: (data: {
    crisisPlan: CrisisPlan;
    contact: TrustedContact;
  }) => void;
  busy: boolean;
}) {
  const t = useT();
  const ids = {
    whoIdCall: useId(),
    whatHelps: useId(),
    whatMakesItWorse: useId(),
    name: useId(),
    relationship: useId(),
    phone: useId(),
  };

  const [fields, setFields] = useState<Fields>(() => ({
    ...EMPTY,
    whoIdCall: existingPlan?.whoIdCall ?? "",
    whatHelps: existingPlan?.whatHelps ?? "",
    whatMakesItWorse: existingPlan?.whatMakesItWorse ?? "",
    name: existingContact?.name ?? "",
    relationship: existingContact?.relationship ?? "",
    phone: existingContact?.phone ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {},
  );

  const set = (key: keyof Fields) => (value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {};
    (Object.keys(fields) as Array<keyof Fields>).forEach((key) => {
      if (fields[key].trim() === "") {
        next[key] = t("onboarding.crisis.error.required");
      }
    });
    if (!next.phone && !phoneLooksValid(fields.phone)) {
      next.phone = t("onboarding.crisis.error.phone");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      crisisPlan: {
        whoIdCall: fields.whoIdCall.trim(),
        whatHelps: fields.whatHelps.trim(),
        whatMakesItWorse: fields.whatMakesItWorse.trim(),
      },
      contact: {
        name: fields.name.trim(),
        relationship: fields.relationship.trim(),
        phone: fields.phone.trim(),
      },
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        {t("onboarding.crisis.heading")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {t("onboarding.crisis.subline")}
      </p>

      <div className="mt-6 space-y-5">
        <TextArea
          id={ids.whoIdCall}
          label={t("onboarding.crisis.q1.label")}
          placeholder={t("onboarding.crisis.q1.placeholder")}
          value={fields.whoIdCall}
          onChange={set("whoIdCall")}
          error={errors.whoIdCall}
        />
        <TextArea
          id={ids.whatHelps}
          label={t("onboarding.crisis.q2.label")}
          placeholder={t("onboarding.crisis.q2.placeholder")}
          value={fields.whatHelps}
          onChange={set("whatHelps")}
          error={errors.whatHelps}
        />
        <TextArea
          id={ids.whatMakesItWorse}
          label={t("onboarding.crisis.q3.label")}
          placeholder={t("onboarding.crisis.q3.placeholder")}
          value={fields.whatMakesItWorse}
          onChange={set("whatMakesItWorse")}
          error={errors.whatMakesItWorse}
        />
      </div>

      <fieldset className="mt-8 rounded-xl border border-gray-200 p-5">
        <legend className="px-2 font-semibold text-gray-900">
          {t("onboarding.crisis.contact.heading")}
        </legend>

        <div className="space-y-5">
          <TextField
            id={ids.name}
            label={t("onboarding.crisis.contact.name")}
            value={fields.name}
            onChange={set("name")}
            error={errors.name}
          />
          <TextField
            id={ids.relationship}
            label={t("onboarding.crisis.contact.relationship")}
            value={fields.relationship}
            onChange={set("relationship")}
            error={errors.relationship}
          />
          <TextField
            id={ids.phone}
            label={t("onboarding.crisis.contact.phone")}
            type="tel"
            inputMode="tel"
            value={fields.phone}
            onChange={set("phone")}
            error={errors.phone}
          />
        </div>

        <p className="mt-4 text-sm text-gray-600">
          {t("onboarding.crisis.contact.helper")}
        </p>

        {/* The one disclosed exception to "nothing is shared without you
            seeing it first" -- see docs/blueprint/08-safety-and-privacy.md,
            which flagged this as undisclosed. Lives next to the contact
            fields themselves, since that's the person it's actually about. */}
        <div className="mt-4 flex gap-3 rounded-xl border border-brand/15 bg-brand/[0.06] p-4">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-5 w-5 shrink-0 text-brand"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
          <p className="text-sm leading-relaxed text-gray-700">
            {t("onboarding.crisis.contact.emergencyDisclosure")}
          </p>
        </div>
      </fieldset>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-brand"
        >
          {t("action.back")}
        </button>
        <button type="submit" disabled={busy} className="btn-primary">
          {t("onboarding.crisis.submit")}
        </button>
      </div>
    </form>
  );
}
