import type { Metadata } from "next";
import Accordion from "@/components/Accordion";
import { Section } from "@/components/Section";
import { faqCategories } from "@/data/faq";

export const metadata: Metadata = { title: "FAQs | Mind.AI" };

export default function Page() {
  return (
    <Section>
      <div className="editorial-panel mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Helpful answers</p>
        <h1 className="h-display mt-3 text-4xl sm:text-5xl">Frequently Asked Questions</h1>
      </div>
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
