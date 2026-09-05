import type { Metadata } from "next";
import { Avatar } from "@/components/art";
import { Section } from "@/components/Section";
import { experts } from "@/data/experts";

export const metadata: Metadata = { title: "Our Experts | Mind.AI" };

export default function Page() {
  return (
    <Section>
      <div className="editorial-panel mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">People first</p>
        <h1 className="h-display mt-3 text-4xl sm:text-5xl">Meet Our Expert Doctors</h1>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {experts.map((e) => (
          <div
            key={e.name}
            className="feature-tile group"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Avatar name={e.name} />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-gray-900">
                  {e.name}
                </h2>
                <p className="text-xs text-gray-500">{e.experience}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm text-gray-600">
              <div>{e.price}</div>
              <div>
                <span className="font-semibold text-gray-800">Expertise:</span>{" "}
                {e.expertise}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Speaks:</span>{" "}
                {e.speaks}
              </div>
              <div>
                <span className="font-semibold text-gray-800">
                  Next online slot:
                </span>{" "}
                {e.nextSlot}
              </div>
            </dl>
            <button className="btn-primary mt-5 w-full">Book Appointment</button>
          </div>
        ))}
      </div>
    </Section>
  );
}
