import Link from "next/link";
import Accordion from "@/components/Accordion";
import { Section, SectionHeading } from "@/components/Section";
import { CalmScene, ConditionGlyph, TopicThumb } from "@/components/art";
import type { ServiceContent } from "@/data/services";

export default function ServicePage({ data }: { data: ServiceContent }) {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream">
        <div className="container-x grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <h1 className="h-display text-4xl leading-tight sm:text-5xl">
              {data.heroTitle}
            </h1>
            <p className="mt-5 text-gray-600">{data.heroLead}</p>
            <Link href="/find-your-doctor" className="btn-primary mt-8">
              Start Your Journey
            </Link>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-2xl lg:mr-0">
            <CalmScene />
            <div className="absolute bottom-4 right-4 h-14 w-14 drop-shadow">
              <ConditionGlyph kind={data.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* Types */}
      <Section>
        <SectionHeading title={data.typesHeading} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.types.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="mb-4 h-14 w-14 overflow-hidden rounded-lg">
                <TopicThumb title={t.name} />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900">
                {t.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{t.blurb}</p>
              <button className="mt-4 text-sm font-semibold text-brand">
                Read More →
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Signs */}
      <Section className="bg-cream-alt">
        <SectionHeading title={data.signsHeading} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.signs.map((cluster) => (
            <div
              key={cluster.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h3 className="mb-3 font-display font-semibold text-brand">
                {cluster.title}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {cluster.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-brand">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="rounded-3xl bg-brand px-8 py-12 text-center text-white">
          <h2 className="h-display text-2xl text-white sm:text-3xl">
            Not sure what kind of support you need?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Support isn’t one-size-fits-all. Talk to someone who gets it and
            we’ll help you find the kind of care that actually fits your needs.
          </p>
          <Link
            href="/find-your-doctor"
            className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand hover:bg-cream"
          >
            Start Your Journey
          </Link>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-cream">
        <SectionHeading title={data.faqHeading} />
        <div className="mx-auto max-w-3xl">
          <Accordion items={data.faqs.map((q) => ({ q }))} />
        </div>
      </Section>
    </>
  );
}
