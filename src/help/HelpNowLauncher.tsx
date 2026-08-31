"use client";

import { useRef } from "react";
import { useHelpNowGate } from "./HelpNowGate";
import HelpNowButton from "./HelpNowButton";
import HelpNowSheet from "./HelpNowSheet";

/**
 * The "Need help now" pill plus its sheet. Used by the app Shell (every
 * authenticated screen) and by the marketing layout.
 *
 * The sheet's open state lives in HelpNowGate so it can also be opened from
 * elsewhere if needed.
 */
export default function HelpNowLauncher({
  visible = true,
  raised = false,
}: {
  visible?: boolean;
  /** Lift the pill above the app's bottom dock (Shell passes this in-app). */
  raised?: boolean;
}) {
  const { sheetOpen, openSheet, closeSheet } = useHelpNowGate();
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!visible) return null;

  return (
    <>
      <HelpNowButton
        triggerRef={triggerRef}
        expanded={sheetOpen}
        raised={raised}
        onOpen={() => openSheet(triggerRef.current)}
      />
      {sheetOpen && <HelpNowSheet onClose={closeSheet} />}
    </>
  );
}
