"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/i18n";
import { wipeEverything } from "../wipe";

export default function DeleteAccountPage() {
  const t = useT();
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirmWord = t("me.delete.confirmWord");
  const armed = typed.trim().toUpperCase() === confirmWord.toUpperCase();

  const wipe = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await wipeEverything();
    } catch {
      // Deletion is not something to report as done when it did not happen.
      setBusy(false);
      setFailed(true);
      return;
    }
    setDone(true);
    // Full navigation so the query cache and in-memory state reset too.
    window.setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  };

  if (done) {
    return (
      <div className="container-x max-w-xl py-16 pb-28">
        <p role="status" className="font-display text-lg text-gray-900">
          {t("me.delete.done")}
        </p>
      </div>
    );
  }

  return (
    <div className="container-x max-w-xl py-12 pb-28">
      <Link href="/me" className="text-sm font-semibold text-brand">
        ← {t("data.back")}
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold text-gray-900">
        {t("me.delete.heading")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {t("me.delete.body")}
      </p>

      <label className="mt-8 block text-sm font-semibold text-gray-700">
        {t("me.delete.confirmLabel")}
      </label>
      <input
        type="text"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />

      {failed && (
        <p role="alert" className="mt-4 text-sm text-crisis">
          {t("state.error")}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          disabled={!armed || busy}
          onClick={wipe}
          className="inline-flex items-center justify-center rounded-lg bg-crisis px-6 py-3 text-sm font-semibold text-white hover:bg-crisis-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("me.delete.button")}
        </button>
        <Link href="/me" className="text-sm font-semibold text-gray-500">
          {t("me.delete.cancel")}
        </Link>
      </div>
    </div>
  );
}
