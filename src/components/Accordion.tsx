"use client";

import { useState } from "react";

export type AccordionItem = { q: string; a?: string };

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-gray-800">{item.q}</span>
              <span className="text-brand">{isOpen ? "–" : "+"}</span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-gray-600">
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
