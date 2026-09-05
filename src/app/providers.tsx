"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // The Help Now sheet must read plan + contact from cache with no
            // network, so cached data never goes stale on its own.
            staleTime: Infinity,
            gcTime: Infinity,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // The counsellor console is a wholly separate principal type (G) with its
  // own auth, its own console-api client, and its own QueryClientProvider
  // one level down in (console)/layout.tsx -- it never calls useI18n().
  // I18nProvider's useOnboardingProgress() would otherwise fire on every
  // console page load and, on a 401, silently mint a brand-new anonymous
  // *student* account as a side effect of a counsellor visiting /console.
  const isConsole = pathname?.startsWith("/console");

  if (isConsole) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return (
    <QueryClientProvider client={client}>
      <I18nProvider>{children}</I18nProvider>
    </QueryClientProvider>
  );
}
