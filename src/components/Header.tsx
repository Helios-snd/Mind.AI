"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { primaryNav, standaloneNav } from "@/data/nav";

export default function Header() {
  const [openMobile, setOpenMobile] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname() ?? "/";

  const isCurrent = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className="sticky top-0 z-50 border-b border-ink/[0.07] bg-cream-alt/85 shadow-[0_8px_30px_-24px_rgba(47,51,37,0.45)] backdrop-blur-xl"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpenGroup(null);
          setOpenMobile(false);
        }
      }}
    >
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpenGroup(null)}>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-lg shadow-soft transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            🪷
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Mind.AI
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((group) => (
            <div key={group.label} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openGroup === group.label}
                onClick={() => setOpenGroup((current) => current === group.label ? null : group.label)}
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${group.items.some((item) => isCurrent(item.href)) ? "bg-brand/10 text-brand" : "text-gray-700 hover:bg-cream hover:text-brand"}`}
              >
                {group.label}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform ${openGroup === group.label ? "rotate-180" : ""}`}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {openGroup === group.label && (
              <div role="menu" className="absolute left-0 top-[calc(100%+0.6rem)] min-w-[280px] rounded-2xl border border-ink/[0.08] bg-cream-alt/95 p-2 shadow-card backdrop-blur-xl animate-fade-up">
                <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-earth/70">Explore {group.label}</p>
                {group.items.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpenGroup(null)}
                    className={`block rounded-xl px-3 py-2.5 text-sm transition ${isCurrent(item.href) ? "bg-brand/10 font-semibold text-brand" : "text-gray-600 hover:bg-cream hover:text-brand"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              )}
            </div>
          ))}
          {standaloneNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${isCurrent(item.href) ? "bg-brand/10 text-brand" : "text-gray-700 hover:bg-cream hover:text-brand"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/onboarding" className="btn-primary">
            Get started
          </Link>
          <Link href="/login" className="btn-outline">
            Login
          </Link>
          <Link
            href="/volunteer"
            aria-label="Volunteer with us"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            ♥
          </Link>
        </div>

        <button
          className="grid h-11 w-11 place-items-center rounded-xl text-ink transition hover:bg-cream lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={openMobile}
          aria-controls="mobile-navigation"
          onClick={() => setOpenMobile((v) => !v)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d={openMobile ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"}
              stroke="#2F3325"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {openMobile && (
        <div id="mobile-navigation" className="border-t border-ink/[0.07] bg-cream-alt/95 px-5 py-5 shadow-card backdrop-blur-xl animate-fade-up lg:hidden">
          {primaryNav.map((group) => (
            <div key={group.label} className="rounded-2xl border border-ink/[0.06] bg-white/50 px-4 py-3 [&:not(:last-child)]:mb-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-earth">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setOpenMobile(false)}
                  className={`block rounded-lg px-2 py-2 text-sm transition ${isCurrent(item.href) ? "bg-brand/10 font-semibold text-brand" : "text-gray-700 hover:bg-cream"}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          {standaloneNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpenMobile(false)}
              className={`mb-3 block rounded-xl border border-ink/[0.06] bg-white/50 px-4 py-3 text-sm font-semibold transition ${isCurrent(item.href) ? "text-brand" : "text-gray-700 hover:bg-cream"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/onboarding"
            onClick={() => setOpenMobile(false)}
            className="btn-primary mt-3 w-full"
          >
            Get started
          </Link>
          <Link
            href="/login"
            onClick={() => setOpenMobile(false)}
            className="btn-outline mt-2 w-full"
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
