import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Login | Mind.AI" };

export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-8">
        <h1 className="h-display text-2xl">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">
          Log in to continue your journey.
        </p>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-gray-500">
          New to Mind.AI?{" "}
          <Link href="/onboarding" className="font-semibold text-brand">
            Let&apos;s Find What Works for You
          </Link>
        </p>
      </div>
    </Section>
  );
}
