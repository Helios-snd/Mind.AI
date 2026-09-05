import type { Metadata } from "next";
import Link from "next/link";
import { TopicThumb, LineIcon } from "@/components/art";
import { Section, SectionHeading } from "@/components/Section";

export const metadata: Metadata = { title: "Resources | Mind.AI" };

const videos = [
  "Fastest way to lower stress",
  "Improve mental health immediately",
  "Symptoms of bipolar disorder",
];

const blogs = [
  { title: "Tobacco Addiction — Understanding and Coping", href: "/tobacco-addiction" },
  { title: "Counseling vs Psychotherapy", href: "/counseling-vs-psychotherapy" },
  { title: "Medication for OCD — What You Need to Know", href: "/all-resources#blogs" },
];

const assessments = ["Depression Test", "Anxiety Test", "ADHD Test"];

export default function Page() {
  return (
    <>
      <section className="container-x pt-10 sm:pt-16">
        <div className="editorial-panel">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Mind.AI resources</p>
          <h1 className="h-display mt-3 max-w-xl text-4xl sm:text-5xl">Small moments of support, collected in one place.</h1>
          <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-earth">
            {[["Videos", "#videos"], ["Blogs", "#blogs"], ["Assessments", "#assessment"], ["Music", "#music"]].map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full border border-brand/15 bg-white/60 px-4 py-2 transition hover:bg-brand hover:text-white">{label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Section id="videos">
        <SectionHeading
          title="Watch Expert-Recommended Videos"
          subtitle="Gain valuable insights from short, informative videos curated by mental health experts."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {videos.map((v, index) => (
            <div
              key={v}
              className={`resource-tile group ${index === 0 ? "sm:col-span-2" : ""}`}
            >
              <div className="aspect-video w-full overflow-hidden">
                <TopicThumb title={v} />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-brand">
                  Shorts
                </p>
                <h3 className="mt-1 font-display font-semibold text-gray-900">
                  {v}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button className="btn-outline">View All Videos</button>
        </div>
      </Section>

      <Section id="blogs" className="bg-cream">
        <SectionHeading
          title="Explore Insightful Blogs"
          subtitle="Read detailed blogs to expand your knowledge on mental health topics."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {blogs.map((b, index) => (
            <Link
              key={b.title}
              href={b.href}
              className={`resource-tile group ${index === 0 ? "sm:col-span-2" : ""}`}
            >
              <div className="aspect-video w-full overflow-hidden">
                <TopicThumb title={b.title} />
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-gray-900 group-hover:text-brand">
                  {b.title}
                </h3>
                <span className="mt-3 inline-block text-sm font-semibold text-brand">
                  Read Blog →
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button className="btn-outline">View All Blogs</button>
        </div>
      </Section>

      <Section id="assessment">
        <SectionHeading
          title="Take Mental Health Assessments"
          subtitle="Assess your mental health with our easy-to-use online tests."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {assessments.map((a, index) => (
            <Link
              key={a}
              href={`/assessment/${["depression", "anxiety", "adhd"][index]}`}
              className={`feature-tile group text-center ${index === 1 ? "bg-brand/[0.05]" : ""}`}
            >
              <LineIcon name="clipboard" className="mx-auto mb-4 h-14 w-14" />
              <h3 className="font-display font-semibold text-gray-900">{a}</h3>
              <span className="mt-4 inline-flex text-sm font-semibold text-brand">Take assessment →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="music" className="bg-cream">
        <SectionHeading
          title="Calming Music"
          subtitle="Curated audio to help you relax, focus and sleep."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {["Focus", "Sleep", "Unwind"].map((m) => (
            <div
              key={m}
              className="feature-tile"
            >
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <TopicThumb title={m} />
              </div>
              <h3 className="mt-3 font-display font-semibold text-gray-900">
                {m}
              </h3>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
