"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useOnboardingProgress } from "@/api/hooks";
import { AppHeader } from "@/components/AppHeader";
import { LanguageControl } from "./LanguageControl";
import { CrisisPlanControl } from "./CrisisPlanControl";
import { ContactControl } from "./ContactControl";

function RowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-ink/[0.07] bg-cream-alt/50 px-4 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:bg-brand/[0.05]"
    >
      {children}
      <span aria-hidden className="text-brand">
        →
      </span>
    </Link>
  );
}

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
    <div className="container-x max-w-xl pt-8 pb-28 sm:pt-12">
      <AppHeader title={t("me.heading")} subtitle={t("me.sub")} />

      <div className="mt-7 animate-fade-up space-y-6">
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
          <RowLink href="/human">{t("me.human.row")}</RowLink>
          <p className="mt-3 text-xs leading-relaxed text-earth/70">
            {t("me.human.always")}
          </p>
        </Section>

        <Section title={t("me.data.title")}>
          <RowLink href="/data">{t("me.data.see")}</RowLink>
          <p className="mt-3 text-xs leading-relaxed text-earth/80">
            {t("me.data.retention")}
          </p>
          <Link
            href="/me/delete"
            className="mt-3 inline-block text-sm font-semibold text-crisis hover:text-crisis-dark"
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
      <h2 className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-widest text-earth/70">
        {title}
      </h2>
      <div className="card p-4 sm:p-5">{children}</div>
    </section>
  );
}
