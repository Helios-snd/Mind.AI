import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = { title: "For Corporates | Mind.AI" };

export default function Page() {
  return (
    <ComingSoonPage
      title="Mind.AI for Corporates"
      blurb="Workplace mental health support for organisations — assessments, therapy access and manager resources for your teams."
    />
  );
}
