"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Controls whether the persistent "Need help now" button is shown.
 *
 * The Shell shows it on every authenticated screen. Onboarding hides it for
 * steps 1 and 2 and turns it on from step 3 onward, then restores it on unmount.
 */
type GateValue = {
  visible: boolean;
  setVisible: (next: boolean) => void;
};

const HelpNowGateContext = createContext<GateValue | null>(null);

export function HelpNowGateProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const value = useMemo<GateValue>(
    () => ({ visible, setVisible }),
    [visible],
  );
  return createElement(HelpNowGateContext.Provider, { value }, children);
}

export function useHelpNowGate(): GateValue {
  const ctx = useContext(HelpNowGateContext);
  if (!ctx) {
    // Outside an authenticated shell the button simply does not exist.
    return { visible: false, setVisible: () => {} };
  }
  return ctx;
}

/** Imperatively set button visibility for the lifetime of the calling screen. */
export function useSetHelpNowVisible() {
  const { setVisible } = useHelpNowGate();
  return useCallback((next: boolean) => setVisible(next), [setVisible]);
}
