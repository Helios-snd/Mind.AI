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
      <Section id="videos">
        <SectionHeading
          title="Watch Expert-Recommended Videos"
          subtitle="Gain valuable insights from short, informative videos curated by mental health experts."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {videos.map((v) => (
            <div
              key={v}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="aspect-video w-full overflow-hidden">
                <TopicThumb title={v} />
              </div>
              <div className="p-4">
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
          {blogs.map((b) => (
            <Link
              key={b.title}
              href={b.href}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white"
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
          {assessments.map((a) => (
            <div
              key={a}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-center"
            >
              <LineIcon name="clipboard" className="mx-auto mb-4 h-14 w-14" />
              <h3 className="font-display font-semibold text-gray-900">{a}</h3>
              <button className="btn-primary mt-4">Take Test</button>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button className="btn-outline">View All Assessments</button>
        </div>
      </Section>

      <Section id="music" className="bg-cream">
        <SectionHeading
          title="Calming Music"
          subtitle="Curated audio to help you relax, focus and sleep. (Placeholder section — the live menu links here.)"
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {["Focus", "Sleep", "Unwind"].map((m) => (
            <div
              key={m}
              className="rounded-2xl border border-gray-200 bg-white p-6"
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
