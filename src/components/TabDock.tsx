"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Dock, DockIcon } from "@/components/Dock";
import { TodayIcon, TalkIcon, TrendsIcon, MeIcon } from "@/components/icons";
import type { Keys } from "@/i18n/en";

type Tab = {
  href: string;
  labelKey: Keys;
  Icon: (p: { className?: string }) => JSX.Element;
  isActive: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  { href: "/today", labelKey: "nav.today", Icon: TodayIcon, isActive: (p) => p === "/today" },
  { href: "/talk", labelKey: "nav.talk", Icon: TalkIcon, isActive: (p) => p === "/talk" },
  { href: "/trends", labelKey: "nav.trends", Icon: TrendsIcon, isActive: (p) => p === "/trends" },
  {
    href: "/me",
    labelKey: "nav.me",
    Icon: MeIcon,
    isActive: (p) => p === "/me" || p.startsWith("/me/"),
  },
];

export default function TabDock() {
  const pathname = usePathname() ?? "";
  const t = useT();
  const reduced = usePrefersReducedMotion();

  return (
    <nav
      aria-label={t("nav.label")}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]"
    >
      <Dock
        direction="bottom"
        disableMagnification={reduced}
        className="pointer-events-auto"
      >
        {TABS.map(({ href, labelKey, Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <DockIcon key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl " +
                  "transition-colors motion-reduce:transition-none " +
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 " +
                  (active
                    ? "bg-brand/10 text-brand"
                    : "text-earth hover:text-ink")
                }
              >
                <Icon className="h-[46%] w-auto" />
                <span
                  className={
                    "text-[10px] leading-none " +
                    (active ? "font-semibold" : "font-medium")
                  }
                >
                  {t(labelKey)}
                </span>
              </Link>
            </DockIcon>
          );
        })}
      </Dock>
    </nav>
  );
}
