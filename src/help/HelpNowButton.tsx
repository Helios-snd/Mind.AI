"use client";

import type { RefObject } from "react";
import { useT } from "@/i18n";

export default function HelpNowButton({
  triggerRef,
  expanded,
  onOpen,
}: {
  triggerRef: RefObject<HTMLButtonElement>;
  expanded: boolean;
  onOpen: () => void;
}) {
  const t = useT();

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className="fixed bottom-5 right-5 z-40 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
    >
      {t("help.button")}
    </button>
  );
}
