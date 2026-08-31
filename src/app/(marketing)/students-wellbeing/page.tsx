import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = { title: "Students Well-being Programme | Mind.AI" };

export default function Page() {
  return (
    <ComingSoonPage
      title="Students Well-being Programme"
      blurb="A partner programme bringing Mind.AI's mental health support to colleges and universities."
    />
  );
}
