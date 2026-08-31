import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "Terms & Conditions | Mind.AI" };

// The live /terms-and-conditions page currently renders only a heading —
// no body copy has been published yet.
export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="h-display text-4xl">Terms &amp; Conditions</h1>
        <p className="mt-6 italic text-gray-400">
          Terms &amp; Conditions content to be published by the Mind.AI legal team.
        </p>
      </div>
    </Section>
  );
}
