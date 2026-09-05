import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import {
  MeditationScene,
  CareScene,
  ConditionGlyph,
  FeatureGlyph,
  LineIcon,
  TopicThumb,
} from "@/components/art";

const conditions = [
  { name: "Depression", href: "/depression", kind: "depression" as const },
  { name: "Anxiety", href: "/anxiety", kind: "anxiety" as const },
  { name: "ADHD", href: "/adhd", kind: "adhd" as const },
];

const offerings = [
  {
    title: "Diagnosis and Therapy",
    icon: "therapy" as const,
    points: [
      "Personalized care and treatment plans",
      "Cognitive behavioral therapy and mindfulness",
      "Expert diagnosis and therapy services",
    ],
  },
  {
    title: "Self-care and Progress",
    icon: "progress" as const,
    points: [
      "Track your self-care journey with personalized tools",
      "Set and monitor mental health goals",
      "Mindfulness exercises, journaling prompts, and reflections",
    ],
  },
  {
    title: "Community",
    icon: "community" as const,
    points: [
      "Group discussions and peer support",
      "Expert advice from mental health professionals",
      "Build meaningful connections with others",
    ],
  },
];

const whyMindAi = [
  {
    title: "Expert Diagnosis",
    kind: "diagnosis" as const,
    body: "Understand what you're going through with expert-guided mental health assessments.",
  },
  {
    title: "Personalized Therapy",
    kind: "therapy" as const,
    body: "Connect with therapists who get you — and personalize the care you actually need.",
  },
  {
    title: "Holistic Solutions",
    kind: "holistic" as const,
    body: "We look at the whole you — mind, emotions, and life — not just symptoms.",
  },
];

const resources = [
  { tag: "ARTICLE | 3 MIN", title: "Tobacco Addiction", href: "/tobacco-addiction" },
  { tag: "SHORTS", title: "Improve Mental Health Instantly", href: "/all-resources#videos" },
  {
    tag: "ARTICLE | 4 MIN",
    title: "Counseling vs Psychotherapy",
    href: "/counseling-vs-psychotherapy",
  },
];

const news = [
  {
    title: "How does Education Affect Mental Health?",
    author: "Dr. Nicola Williams, Ph.D",
    excerpt:
      "Discover the powerful link between education and mental well-being, and how learning can influence emotional health.",
  },
  {
    title: "Analyzing the Stigma Surrounding Mental Health",
    author: "Sarah Moore",
    excerpt:
      "A closer look at the causes of mental health stigma and its impact on individuals seeking support.",
  },
];

const testimonials = [
  {
    quote:
      "I cannot recommend this enough. My therapist has guided me through some very dark times, and now I feel much more in control of my emotions. The level of support is phenomenal.",
    name: "Sara, HR Manager, Chennai",
  },
  {
    quote:
      "I was sceptical and afraid to be open to another person. I thought I could not do it, but my therapist has been very supportive and just allows me to feel my emotions and simplifies them for me.",
    name: "Anonymous, Cabin Crew, Delhi",
  },
  {
    quote:
      "The platform has completely changed how I deal with stress. I used to struggle with anxiety, but after engaging in therapy sessions, I feel more at peace.",
    name: "Rahul, Software Engineer, Mumbai",
  },
  {
    quote:
      "I was hesitant at first, but now I can’t imagine how I would have managed without their support. The tools provided here are so practical and helpful.",
    name: "Priya, Marketing Executive, Bangalore",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div aria-hidden="true" className="absolute -right-24 top-6 h-80 w-80 rounded-full bg-sage/45 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-32 left-[35%] h-64 w-64 rounded-full bg-white/70 blur-3xl" />
        <div className="container-x relative grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <h1 className="h-display text-5xl leading-[1.05] sm:text-6xl">
              Mental Wellness{" "}
              <span className="block text-brand">Built Daily</span>
            </h1>
            <p className="mt-5 font-display text-2xl text-gray-500">
              Keep Your Mind and Soul Healthy
            </p>
            <p className="mt-4 max-w-md text-gray-500">
              This is your journey to mental clarity — where you finally feel
              understood &amp; in control
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/onboarding" className="btn-primary">
                Let&apos;s Find What Works for You
              </Link>
            </div>
          </div>
          <div className="mx-auto aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-ink/[0.06] shadow-card lg:mr-0">
            <MeditationScene />
          </div>
        </div>
      </section>

      {/* Something feels off */}
      <Section>
        <SectionHeading
          title="Something feels off?"
          subtitle="You don't have to go through it alone — we are here to support your mental health journey with care and compassion."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {conditions.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="surface-card-interactive group text-center"
            >
              <ConditionGlyph kind={c.kind} className="mx-auto mb-3 h-14 w-14" />
              <h3 className="font-display text-lg font-semibold text-gray-900">
                {c.name}
              </h3>
              <span className="mt-2 inline-block text-sm font-semibold text-brand">
                Learn More →
              </span>
            </Link>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-gray-600">
          Whether it is stress, anxiety or something you can’t name yet — our
          team is here to help you feel better. Let’s take the next step
          together.
        </p>
      </Section>

      {/* Offerings */}
      <Section id="offerings">
        <SectionHeading
          title="Let’s Find What Works for You"
          subtitle="Explore Mind.AI’s personalized mental health support — designed for you, by people who’ve been in your shoes."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {offerings.map((o) => (
            <div
              key={o.title}
              className="surface-card-interactive flex flex-col"
            >
              <LineIcon name={o.icon} className="mb-4 h-14 w-14" />
              <h3 className="font-display text-lg font-semibold text-gray-900">
                {o.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {o.points.map((p) => (
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

      {/* Why Mind.AI */}
      <Section className="bg-cream">
        <SectionHeading title="Why Mind.AI Works for You?" />
        <div className="grid gap-6 sm:grid-cols-3">
          {whyMindAi.map((w) => (
            <div key={w.title} className="surface-card">
              <FeatureGlyph kind={w.kind} className="mb-4 h-14 w-14" />
              <h3 className="font-display text-lg font-semibold text-gray-900">
                {w.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{w.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Mental health guide / resources */}
      <Section>
        <SectionHeading
          title="Your Mental Health Guide"
          subtitle="You don’t need to have it all figured out. Explore simple, real content that helps you make sense of what you’re feeling — one step at a time."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {resources.map((r) => (
            <Link
              key={r.title}
              href={r.href}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="aspect-[5/3] w-full overflow-hidden">
                <TopicThumb title={r.title} />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-brand">
                  {r.tag}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-gray-900 group-hover:text-brand">
                  {r.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/all-resources" className="btn-outline">
            View All Resources →
          </Link>
        </div>
      </Section>

      {/* News */}
      <Section className="bg-cream-alt">
        <SectionHeading
          title="What’s Happening in Mental Health"
          subtitle="Stay updated on how the world is talking about mental health — from new research to real change, and how Mind.AI is helping shape the conversation."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {news.map((n) => (
            <div
              key={n.title}
              className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                <TopicThumb title={n.title} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gray-900">
                  {n.title}
                </h3>
                <p className="text-xs text-gray-400">{n.author}</p>
                <p className="mt-1 text-sm text-gray-600">{n.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/news" className="btn-outline">
            See What’s New →
          </Link>
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <SectionHeading
          title="Join us and take the first step towards a brighter future."
          subtitle="Change starts with one step — and we’ve helped many take it. We’re walking with you."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <blockquote className="text-sm leading-relaxed text-gray-600">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-gray-900">
                {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* A calm closing, not a competing contact CTA. */}
      <Section className="bg-cream">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="h-display text-3xl sm:text-4xl">
              Concerned about someone’s well-being?
            </h2>
            <p className="mt-4 text-gray-600">
              Watching a loved one struggle is tough. The right care matters. Our
              Care Consultant is here to help you find the best support for
              yourself or a loved one.
            </p>
          </div>
          <div className="mx-auto aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-2xl">
            <CareScene />
          </div>
        </div>
      </Section>

    </>
  );
}
