import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TabDock from "@/components/TabDock";
import { HelpNowGateProvider } from "@/help/HelpNowGate";
import HelpNowLauncher from "@/help/HelpNowLauncher";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Always one tap away, home page included. */}
      <HelpNowGateProvider>
        <HelpNowLauncher raised />
      </HelpNowGateProvider>
      {/* Same app dock as the authenticated shell — visible across the site. */}
      <TabDock />
    </>
  );
}
