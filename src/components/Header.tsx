"use client";

import Link from "next/link";
import { useState } from "react";
import { primaryNav, standaloneNav } from "@/data/nav";

export default function Header() {
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-cream-alt/90 backdrop-blur">
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/15 text-lg">
            🪷
          </span>
          <span className="font-display text-2xl font-semibold text-gray-900">
            Mind.AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((group) => (
            <div key={group.label} className="group relative">
              <button className="flex items-center gap-1 py-2 text-sm font-semibold text-gray-700 group-hover:text-brand">
                {group.label}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-transform group-hover:rotate-180"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="invisible absolute left-0 top-full min-w-[220px] rounded-xl border border-black/5 bg-cream-alt p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                {group.items.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-cream hover:text-brand"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {standaloneNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 text-sm font-semibold text-gray-700 hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/onboarding" className="btn-primary">
            Get started
          </Link>
          <Link href="/login" className="btn-outline">
            Login
          </Link>
          <Link
            href="/volunteer"
            aria-label="Volunteer with us"
            className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white shadow-md shadow-brand/30 hover:bg-brand-dark"
          >
            ♥
          </Link>
        </div>

        <button
          className="lg:hidden"
          aria-label="Toggle menu"
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
        <div className="border-t border-black/5 bg-cream-alt px-5 py-4 lg:hidden">
          {primaryNav.map((group) => (
            <div key={group.label} className="py-2">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setOpenMobile(false)}
                  className="block py-1.5 text-sm text-gray-700"
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
              className="block py-2 text-sm font-semibold text-gray-700"
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
