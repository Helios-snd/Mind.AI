import type { Metadata } from "next";
import { TopicThumb } from "@/components/art";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "News | Mind.AI" };

// Titles captured from /news on the live site.
const posts = [
  "Long work hours and mental health problems",
  "ISKCON guru Gauranga Das shared chat with Google CEO",
  "Mental health in the workplace",
];

export default function Page() {
  return (
    <Section>
      <h1 className="h-display mb-10 text-center text-4xl">Latest News Posts</h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((title) => (
          <article
            key={title}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
          >
            <div className="aspect-video w-full overflow-hidden">
              <TopicThumb title={title} />
            </div>
            <div className="p-5">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <button className="mt-3 text-sm font-semibold text-brand">
                Read More →
              </button>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
