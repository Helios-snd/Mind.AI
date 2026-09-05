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
            <Link href="/onboarding" className="btn-primary mt-8">
              Let&apos;s Find What Works for You
            </Link>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-3xl border border-ink/[0.06] shadow-card lg:mr-0">
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
              className="surface-card-interactive group relative overflow-hidden"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-sage/45 ring-1 ring-brand/10 transition-transform duration-300 group-hover:scale-105">
                <TopicThumb title={t.name} />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900">
                {t.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{t.blurb}</p>
              <button className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand transition-transform group-hover:translate-x-1">
                Read More <span aria-hidden="true">→</span>
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
              className="surface-card relative overflow-hidden"
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
        <div className="relative overflow-hidden rounded-[2rem] bg-brand px-8 py-12 text-center text-white shadow-card">
          <div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sage/20 blur-2xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-cream/15 blur-2xl" />
          <div className="relative">
          <h2 className="h-display text-2xl text-white sm:text-3xl">
            Not sure what kind of support you need?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Support isn’t one-size-fits-all. Talk to someone who gets it and
            we’ll help you find the kind of care that actually fits your needs.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand hover:bg-cream"
          >
            Let&apos;s Find What Works for You
          </Link>
          </div>
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
