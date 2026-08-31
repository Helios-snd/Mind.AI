"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Owns two things for the "Need help now" affordance:
 *  - `visible`: whether the persistent pill is shown. The Shell shows it on every
 *    authenticated screen; onboarding hides it for steps 1–2.
 *  - the sheet's open state, so the sheet can be triggered from somewhere other
 *    than the pill (the Talk screen puts its trigger in the header instead,
 *    because the pill would collide with the composer + dock).
 */
type GateValue = {
  visible: boolean;
  setVisible: (next: boolean) => void;
  sheetOpen: boolean;
  /** Open the sheet. Pass the triggering element to return focus to it on close. */
  openSheet: (trigger?: HTMLElement | null) => void;
  closeSheet: () => void;
};

const HelpNowGateContext = createContext<GateValue | null>(null);

export function HelpNowGateProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openSheet = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null;
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    triggerRef.current?.focus?.();
    triggerRef.current = null;
  }, []);

  const value = useMemo<GateValue>(
    () => ({ visible, setVisible, sheetOpen, openSheet, closeSheet }),
    [visible, sheetOpen, openSheet, closeSheet],
  );
  return createElement(HelpNowGateContext.Provider, { value }, children);
}

export function useHelpNowGate(): GateValue {
  const ctx = useContext(HelpNowGateContext);
  if (!ctx) {
    // Outside an authenticated shell the button simply does not exist.
    return {
      visible: false,
      setVisible: () => {},
      sheetOpen: false,
      openSheet: () => {},
      closeSheet: () => {},
    };
  }
  return ctx;
}

/** Imperatively set button visibility for the lifetime of the calling screen. */
export function useSetHelpNowVisible() {
  const { setVisible } = useHelpNowGate();
  return useCallback((next: boolean) => setVisible(next), [setVisible]);
}
