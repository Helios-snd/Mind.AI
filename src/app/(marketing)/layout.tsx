import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StudentDock from "@/components/StudentDock";
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
      {/* The student tab bar follows an onboarded visitor onto the public
          site, but a logged-out reader never sees tabs they cannot open. */}
      <StudentDock />
    </>
  );
}
