import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "Contact Us | Mind.AI" };

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-center text-4xl">Contact Us</h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-gray-900">Get in Touch</h2>
          <p className="mt-3 text-gray-600">
            We&apos;re here to help. Reach out to us through any of the options
            below, and we&apos;ll get back to you as soon as possible.
          </p>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-gray-800">Location:</dt>
              <dd className="text-gray-600">
                Plot no 146, ground floor, sector 2B, Vaishali, Ghaziabad, Uttar
                Pradesh, 201010
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-800">Email:</dt>
              <dd>
                <a
                  href="mailto:contact@mind.ai"
                  className="text-brand hover:underline"
                >
                  contact@mind.ai
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-800">Phone:</dt>
              <dd>
                <a href="tel:+918595967394" className="text-brand hover:underline">
                  +91 85959 67394
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <form className="rounded-2xl border border-gray-200 bg-white p-8">
          <h2 className="font-display text-xl text-gray-900">Send Us a Message</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Your Name
              </label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Message
              </label>
              <textarea
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
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
