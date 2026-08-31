"use client";

import Link from "next/link";
import { useT } from "@/i18n";

export default function HumanPage() {
  const t = useT();

  return (
    <div className="container-x max-w-xl py-12 pb-28">
      <Link href="/me" className="text-sm font-semibold text-brand">
        ← {t("human.back")}
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold text-gray-900">
        {t("human.heading")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {t("human.body")}
      </p>

      <div className="mt-8 space-y-4">
        <a
          href="tel:14416"
          className="block rounded-xl border border-gray-200 p-4 hover:border-brand/40 hover:bg-cream"
        >
          <p className="font-semibold text-gray-900">
            {t("human.telemanas.title")}
          </p>
          <p className="mt-0.5 text-sm text-gray-600">
            {t("human.telemanas.body")}
          </p>
        </a>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="font-semibold text-gray-900">
            {t("human.counsellor.title")}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
            {t("human.counsellor.body")}
          </p>
        </div>
      </div>
    </div>
  );
}
