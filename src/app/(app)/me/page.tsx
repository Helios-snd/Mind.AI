"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useOnboardingProgress } from "@/api/hooks";
import { LanguageControl } from "./LanguageControl";
import { CrisisPlanControl } from "./CrisisPlanControl";
import { ContactControl } from "./ContactControl";

export default function MePage() {
  const t = useT();
  const router = useRouter();
  const progress = useOnboardingProgress();

  useEffect(() => {
    if (progress.data && !progress.data.completedAt) {
      router.replace("/onboarding");
    }
  }, [progress.data, router]);

  return (
    <div className="container-x max-w-xl py-10 pb-28 sm:py-14">
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        {t("me.heading")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">{t("me.sub")}</p>

      <div className="mt-8 space-y-8">
        <Section title={t("me.language.title")}>
          <LanguageControl />
        </Section>

        <Section title={t("me.plan.title")}>
          <CrisisPlanControl />
        </Section>

        <Section title={t("me.contact.title")}>
          <ContactControl />
        </Section>

        <Section title={t("me.human.title")}>
          <Link
            href="/human"
            className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:border-brand/40 hover:bg-cream"
          >
            {t("me.human.row")}
            <span aria-hidden className="text-brand">
              →
            </span>
          </Link>
          <p className="mt-3 text-xs text-gray-400">{t("me.human.always")}</p>
        </Section>

        <Section title={t("me.data.title")}>
          <Link
            href="/data"
            className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:border-brand/40 hover:bg-cream"
          >
            {t("me.data.see")}
            <span aria-hidden className="text-brand">
              →
            </span>
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            {t("me.data.retention")}
          </p>
          <Link
            href="/me/delete"
            className="mt-3 inline-block text-sm font-semibold text-brand-dark"
          >
            {t("me.data.delete")}
          </Link>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
