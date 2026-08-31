import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "Login | Mind.AI" };

// Placeholder auth screen — not yet wired to a backend.
export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-8">
        <h1 className="h-display text-2xl">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">
          Log in to continue your journey.
        </p>
        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Log in
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          New to Mind.AI?{" "}
          <Link href="/find-your-doctor" className="font-semibold text-brand">
            Start your journey
          </Link>
        </p>
      </div>
    </Section>
  );
}
