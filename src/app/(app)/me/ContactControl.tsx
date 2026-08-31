"use client";

import { useId, useState } from "react";
import { useT } from "@/i18n";
import { TextField, phoneLooksValid } from "@/components/formFields";
import { useContact, useSaveContact } from "@/api/hooks";
import type { TrustedContact } from "@/api/types";

const EMPTY: TrustedContact = { name: "", relationship: "", phone: "" };

export function ContactControl() {
  const t = useT();
  const contact = useContact();
  const save = useSaveContact();
  const ids = { name: useId(), relationship: useId(), phone: useId() };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TrustedContact>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof TrustedContact, string>>>({});
  const [justSaved, setJustSaved] = useState(false);

  const current = contact.data ?? null;

  const startEditing = () => {
    setDraft(current ?? EMPTY);
    setErrors({});
    setJustSaved(false);
    setEditing(true);
  };

  const set = (key: keyof TrustedContact) => (value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof TrustedContact, string>> = {};
    (Object.keys(draft) as (keyof TrustedContact)[]).forEach((key) => {
      if (draft[key].trim() === "") next[key] = t("onboarding.crisis.error.required");
    });
    if (!next.phone && !phoneLooksValid(draft.phone)) {
      next.phone = t("onboarding.crisis.error.phone");
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    await save.mutateAsync({
      name: draft.name.trim(),
      relationship: draft.relationship.trim(),
      phone: draft.phone.trim(),
    });
    setEditing(false);
    setJustSaved(true);
  };

  if (editing) {
    return (
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField
          id={ids.name}
          label={t("onboarding.crisis.contact.name")}
          value={draft.name}
          onChange={set("name")}
          error={errors.name}
        />
        <TextField
          id={ids.relationship}
          label={t("onboarding.crisis.contact.relationship")}
          value={draft.relationship}
          onChange={set("relationship")}
          error={errors.relationship}
        />
        <TextField
          id={ids.phone}
          label={t("onboarding.crisis.contact.phone")}
          type="tel"
          inputMode="tel"
          value={draft.phone}
          onChange={set("phone")}
          error={errors.phone}
        />
        <p className="text-sm text-gray-600">
          {t("onboarding.crisis.contact.helper")}
        </p>
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
        <div className="text-sm">
          <p className="font-semibold text-gray-900">{current.name}</p>
          <p className="text-gray-600">
            {t("me.contact.relationshipLine", {
              relationship: current.relationship,
              phone: current.phone,
            })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">{t("me.contact.none")}</p>
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
