"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCounsellor, useConsoleLogout } from "@/console-api/hooks";

/**
 * The counsellor console's own shell -- no Shell/StudentDock (this is a
 * staff tool, not the student app), no "Need help now" button, no i18n
 * (see src/app/providers.tsx: this route group never gets I18nProvider).
 * middleware.ts already redirects a signed-out visitor to /console/login
 * before this ever renders; useCounsellor() below is the belt-and-suspenders
 * client-side check for a cookie that looks present but no longer decodes
 * (expired, or the account was deactivated).
 */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/console/login";
  const counsellor = useCounsellor();
  const logout = useConsoleLogout();
  const router = useRouter();

  if (!isLoginPage && !counsellor.isPending && !counsellor.data) {
    // middleware.ts normally catches this before render; this only fires
    // for a cookie that's present but no longer valid.
    if (typeof window !== "undefined") router.replace("/console/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && (
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <span className="text-sm font-semibold text-gray-900">
            Mind.AI — Counsellor Console
          </span>
          {counsellor.data && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{counsellor.data.name}</span>
              <button
                type="button"
                onClick={() =>
                  logout.mutate(undefined, {
                    onSuccess: () => router.replace("/console/login"),
                  })
                }
                className="font-semibold text-gray-900 hover:underline"
              >
                Log out
              </button>
            </div>
          )}
        </header>
      )}
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
