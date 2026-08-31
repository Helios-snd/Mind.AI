import { TopicThumb } from "@/components/art";
import { Section } from "@/components/Section";
import { CONTACT_EMAIL } from "@/data/nav";

export default function ArticleLayout({
  category,
  date,
  title,
  intro,
  outline,
}: {
  category: string;
  date?: string;
  title: string;
  intro: string;
  outline: string[];
}) {
  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">
          {category}
          {date ? ` | Published on ${date}` : ""}
        </p>
        <h1 className="h-display mt-2 text-3xl sm:text-4xl">{title}</h1>

        <div className="mt-6 aspect-[5/2] w-full overflow-hidden rounded-2xl">
          <TopicThumb title={title} />
        </div>

        <p className="mt-6 text-lg leading-relaxed text-gray-600">{intro}</p>

        <div className="mt-8 rounded-xl border border-dashed border-brand/30 bg-cream p-5 text-sm text-gray-600">
          <p className="font-semibold text-gray-800">
            Full article body to be added by the Mind.AI content team.
          </p>
          <p className="mt-2">Sections on the live article:</p>
          <ul className="mt-2 ml-5 list-disc space-y-1">
            {outline.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>

        <hr className="my-10 border-gray-200" />
        <p className="text-sm text-gray-500">
          If you need any assistance, feel free to contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand">
            {CONTACT_EMAIL}
          </a>
          . We&apos;re here to support you every step of the way.
        </p>
      </article>
    </Section>
  );
}
