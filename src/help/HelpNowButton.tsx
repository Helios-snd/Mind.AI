"use client";

import type { RefObject } from "react";
import { useT } from "@/i18n";

function LifebuoyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M9.6 9.6 6.3 6.3M14.4 9.6l3.3-3.3M9.6 14.4l-3.3 3.3M14.4 14.4l3.3 3.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HelpNowButton({
  triggerRef,
  expanded,
  onOpen,
  raised = false,
}: {
  triggerRef: RefObject<HTMLButtonElement>;
  expanded: boolean;
  onOpen: () => void;
  /** Lift the pill above the app's bottom dock. Off on marketing pages. */
  raised?: boolean;
}) {
  const t = useT();

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className={
        "group fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-crisis py-2.5 pl-3 pr-4 text-sm font-semibold text-white shadow-pill ring-1 ring-white/10 transition-colors hover:bg-crisis-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-crisis/30 " +
        (raised
          ? "bottom-[calc(env(safe-area-inset-bottom,0px)+6rem)]"
          : "bottom-4 sm:bottom-5")
      }
    >
      <LifebuoyIcon className="h-[18px] w-[18px]" />
      {t("help.button")}
    </button>
  );
}
