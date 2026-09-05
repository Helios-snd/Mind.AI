"use client";

import { useState } from "react";

export type AccordionItem = { q: string; a?: string };

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-ink/[0.07] rounded-[1.5rem] border border-ink/[0.08] bg-cream-alt/80 shadow-soft">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-brand/[0.035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand/15"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-display font-semibold text-ink">{item.q}</span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-lg leading-none text-brand transition-transform">{isOpen ? "–" : "+"}</span>
            </button>
            {isOpen && (
              <div className="animate-fade-up px-5 pb-5 text-sm leading-relaxed text-earth">
                {item.a ?? (
                  <span className="italic text-gray-400">
                    Answer copy to be added from the Mind.AI content team.
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
