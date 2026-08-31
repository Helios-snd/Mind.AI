"use client";

import { usePathname } from "next/navigation";
import { HelpNowGateProvider, useHelpNowGate } from "@/help/HelpNowGate";
import HelpNowLauncher from "@/help/HelpNowLauncher";
import TabDock from "@/components/TabDock";

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
  const pathname = usePathname() ?? "";

  // The dock is the app's tab nav; onboarding is a linear flow without it.
  const showDock = pathname !== "/onboarding";

  return (
    <>
      <main className="flex-1">{children}</main>
      <HelpNowLauncher visible={visible} raised={showDock} />
      {showDock && <TabDock />}
    </>
  );
}
