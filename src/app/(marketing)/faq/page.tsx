import type { Metadata } from "next";
import Accordion from "@/components/Accordion";
import { Section } from "@/components/Section";
import { faqCategories } from "@/data/faq";

export const metadata: Metadata = { title: "FAQs | Mind.AI" };

export default function Page() {
  return (
    <Section>
      <h1 className="h-display mb-10 text-center text-4xl">
        Frequently Asked Questions
      </h1>
      <div className="mx-auto max-w-3xl space-y-10">
        {faqCategories.map((cat) => (
          <div key={cat.category}>
            <h2 className="mb-4 font-display text-xl font-semibold text-brand">
              {cat.category}
            </h2>
            <Accordion items={cat.questions.map((q) => ({ q }))} />
          </div>
        ))}
      </div>
    </Section>
  );
}
