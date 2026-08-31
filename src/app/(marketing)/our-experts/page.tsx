import type { Metadata } from "next";
import { Avatar } from "@/components/art";
import { Section } from "@/components/Section";
import { experts } from "@/data/experts";

export const metadata: Metadata = { title: "Our Experts | Mind.AI" };

export default function Page() {
  return (
    <Section>
      <h1 className="h-display mb-10 text-center text-4xl">
        Meet Our Expert Doctors
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {experts.map((e) => (
          <div
            key={e.name}
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0">
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
