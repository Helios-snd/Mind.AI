import Link from "next/link";
import { Section } from "@/components/Section";

export default function NotFound() {
  return (
    <Section>
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-6xl font-bold text-brand">404</p>
        <h1 className="mt-4 font-display text-2xl text-gray-900">
          Page not found
        </h1>
        <p className="mt-2 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Back home
        </Link>
      </div>
    </Section>
  );
}
