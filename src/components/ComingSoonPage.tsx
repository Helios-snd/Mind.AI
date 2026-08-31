import Link from "next/link";
import { CalmScene } from "@/components/art";
import { Section } from "@/components/Section";

export default function ComingSoonPage({
  title,
  blurb,
}: {
  title: string;
  blurb: string;
}) {
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="h-display text-4xl">{title}</h1>
        <p className="mt-4 text-gray-600">{blurb}</p>
        <div className="mx-auto mt-8 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl">
          <CalmScene />
        </div>
        <p className="mt-6 text-sm italic text-gray-400">
          This page exists in the live navigation but its content was not part of
          this build pass.
        </p>
        <Link href="/contact-us" className="btn-primary mt-6">
          Get in Touch
        </Link>
      </div>
    </Section>
  );
}
