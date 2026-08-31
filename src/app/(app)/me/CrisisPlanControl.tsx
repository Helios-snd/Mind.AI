"use client";

import { useId, useState } from "react";
import { useT } from "@/i18n";
import type { Keys } from "@/i18n/en";
import { TextArea } from "@/components/formFields";
import { useCrisisPlan, useSaveCrisisPlan } from "@/api/hooks";
import type { CrisisPlan } from "@/api/types";

const FIELDS: {
  key: keyof CrisisPlan;
  labelKey: Keys;
  placeholderKey: Keys;
}[] = [
  {
    key: "whoIdCall",
    labelKey: "onboarding.crisis.q1.label",
    placeholderKey: "onboarding.crisis.q1.placeholder",
  },
  {
    key: "whatHelps",
    labelKey: "onboarding.crisis.q2.label",
    placeholderKey: "onboarding.crisis.q2.placeholder",
  },
  {
    key: "whatMakesItWorse",
    labelKey: "onboarding.crisis.q3.label",
    placeholderKey: "onboarding.crisis.q3.placeholder",
  },
];

const EMPTY: CrisisPlan = { whoIdCall: "", whatHelps: "", whatMakesItWorse: "" };

export function CrisisPlanControl() {
  const t = useT();
  const plan = useCrisisPlan();
  const save = useSaveCrisisPlan();
  const ids = {
    whoIdCall: useId(),
    whatHelps: useId(),
    whatMakesItWorse: useId(),
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CrisisPlan>(EMPTY);
  const [justSaved, setJustSaved] = useState(false);

  const current = plan.data ?? null;

  const startEditing = () => {
    setDraft(current ?? EMPTY);
    setJustSaved(false);
    setEditing(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await save.mutateAsync({
      whoIdCall: draft.whoIdCall.trim(),
      whatHelps: draft.whatHelps.trim(),
      whatMakesItWorse: draft.whatMakesItWorse.trim(),
    });
    setEditing(false);
    setJustSaved(true);
  };

  if (editing) {
    return (
      <form onSubmit={submit} className="space-y-4">
        {FIELDS.map((field) => (
          <TextArea
            key={field.key}
            id={ids[field.key]}
            label={t(field.labelKey)}
            placeholder={t(field.placeholderKey)}
            value={draft[field.key]}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, [field.key]: value }))
            }
          />
        ))}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={save.isPending} className="btn-primary">
            {t("me.plan.save")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm font-semibold text-gray-500"
          >
            {t("me.plan.cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      {current ? (
        <dl className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <dt className="text-sm font-semibold text-gray-700">
                {t(field.labelKey)}
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-sm text-gray-900">
                {current[field.key] || "—"}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-gray-500">{t("me.plan.none")}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={startEditing}
          className="text-sm font-semibold text-brand"
        >
          {t("me.plan.edit")}
        </button>
        {justSaved && (
          <span className="text-xs text-gray-400">{t("me.plan.saved")}</span>
        )}
      </div>
    </div>
  );
}
