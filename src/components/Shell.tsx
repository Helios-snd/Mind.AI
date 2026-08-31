"use client";

import { HelpNowGateProvider, useHelpNowGate } from "@/help/HelpNowGate";
import HelpNowLauncher from "@/help/HelpNowLauncher";

/**
 * The authenticated app frame. Renders the current screen and owns the
 * persistent "Need help now" launcher. Onboarding steps 1–2 hide the button
 * via HelpNowGate.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <HelpNowGateProvider>
      <ShellFrame>{children}</ShellFrame>
    </HelpNowGateProvider>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const { visible } = useHelpNowGate();

  return (
    <>
      <main className="flex-1">{children}</main>
      <HelpNowLauncher visible={visible} />
    </>
  );
}
