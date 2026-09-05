"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";
import { AppHeader } from "@/components/AppHeader";
import { useTalkConversation } from "@/api/hooks";
import { AccountStatus } from "./AccountStatus";
import { LanguageControl } from "./LanguageControl";
import { CrisisPlanControl } from "./CrisisPlanControl";
import { ContactControl } from "./ContactControl";
import { PatternsSummary } from "./PatternsSummary";
import { WellbeingSummary } from "./WellbeingSummary";

function RowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-ink/[0.07] bg-cream-alt/50 px-4 py-3.5 text-sm font-semibold text-ink transition hover:border-brand/30 hover:bg-brand/[0.05] hover:shadow-soft"
    >
      {children}
      <span aria-hidden className="text-brand">
        →
      </span>
    </Link>
  );
}

export default function MePage() {
  const { t, n } = useI18n();
  const talk = useTalkConversation();

  return (
    <div className="container-x max-w-xl pt-8 pb-28 sm:pt-12">
      <AppHeader title={t("me.heading")} subtitle={t("me.sub")} />

      <div className="mt-7 animate-fade-up space-y-6">
        <Section title={t("me.account.title")}>
          <AccountStatus />
        </Section>

        <Section title={t("me.patterns.title")}>
          <PatternsSummary />
        </Section>

        <Section title={t("me.talk.title")}>
          {talk.isPending ? (
            <p className="text-sm text-earth">{t("state.loading")}</p>
          ) : talk.isError || !talk.data ? (
            <p className="text-sm text-earth">{t("state.error")}</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-earth">
                {talk.data.messages.length === 0
                  ? t("me.talk.empty")
                  : t("me.talk.messages", { count: n(talk.data.messages.length) })}
              </p>
              <RowLink href="/talk">{t("me.talk.open")}</RowLink>
            </div>
          )}
        </Section>

        <Section title={t("me.wellbeing.title")}>
          <WellbeingSummary />
        </Section>

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
      <div className="settings-surface">{children}</div>
    </section>
  );
}
