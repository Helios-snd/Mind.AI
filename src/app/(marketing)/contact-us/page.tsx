import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "Contact Us | Mind.AI" };

export default function Page() {
  return (
    <Section>
      <div className="editorial-panel grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Contact Mind.AI</p>
          <h1 className="h-display mt-3 text-5xl">Let&apos;s talk.</h1>
          <p className="mt-4 max-w-md text-earth">Questions, feedback, or a conversation about caring for students—write to us and we&apos;ll point you in the right direction.</p>
        </div>
        <div aria-hidden="true" className="relative mx-auto h-36 w-36 rounded-full bg-brand/10 ring-[18px] ring-brand/[0.06] after:absolute after:-right-7 after:top-2 after:h-12 after:w-12 after:rounded-full after:bg-sage" />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div className="py-2">
          <h2 className="font-display text-2xl text-ink">Here when you need us.</h2>
          <p className="mt-3 text-earth">
            We&apos;re here to help. Reach out to us through any of the options
            below, and we&apos;ll get back to you as soon as possible.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="highlight-panel rounded-2xl border border-brand/10 bg-brand/[0.04] p-4">
              <dt className="font-semibold text-ink">Location</dt>
              <dd className="mt-1 text-earth">
                Ram Nagar, Sodepur, Khardah, Kolkata, West Bengal, 700110
              </dd>
            </div>
            <div className="highlight-panel rounded-2xl border border-brand/10 bg-brand/[0.04] p-4">
              <dt className="font-semibold text-ink">Email</dt>
              <dd className="mt-1">
                <a
                  href="mailto:contact@mind.ai"
                  className="text-brand hover:underline"
                >
                  contact@mind.ai
                </a>
              </dd>
            </div>
            <div className="highlight-panel rounded-2xl border border-brand/10 bg-brand/[0.04] p-4">
              <dt className="font-semibold text-ink">Phone</dt>
              <dd className="mt-1">
                <a href="tel:+919907061973" className="text-brand hover:underline">
                  +91 99070 61973
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <form className="rounded-[1.75rem] border border-ink/[0.08] bg-cream-alt/90 p-6 shadow-card sm:p-8">
          <h2 className="font-display text-xl text-ink">Send us a message</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Your Name
              </label>
              <input className="field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                className="field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Message
              </label>
              <textarea
                rows={5}
                className="field min-h-32"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Submit
            </button>
          </div>
        </form>
      </div>
    </Section>
  );
}
