"use client";

import { useCallback, useRef, useState } from "react";
import HelpNowButton from "./HelpNowButton";
import HelpNowSheet from "./HelpNowSheet";

/**
 * The persistent "Need help now" button plus its sheet, with open-state and
 * focus-return wiring. Used by the app Shell (every authenticated screen) and by
 * the marketing layout, so it is always one tap away from the home page too.
 */
export default function HelpNowLauncher({
  visible = true,
}: {
  visible?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  if (!visible) return null;

  return (
    <>
      <HelpNowButton
        triggerRef={triggerRef}
        expanded={open}
        onOpen={() => setOpen(true)}
      />
      {open && <HelpNowSheet onClose={close} />}
    </>
  );
}
