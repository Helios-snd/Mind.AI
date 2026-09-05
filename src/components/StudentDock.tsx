"use client";

import { useEffect, useState } from "react";
import TabDock from "@/components/TabDock";

/**
 * Renders the student tab bar on public pages, but only once the visitor has
 * an account and has finished onboarding.
 *
 * It reads a small non-httpOnly hint cookie rather than calling the API,
 * because an API call from the marketing layout would mint an anonymous
 * account for anyone who so much as opened the home page. The cookie carries
 * no secret and grants nothing — the API is still the authorization boundary.
 */
export default function StudentDock() {
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const stage = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("mind_stage="))
      ?.split("=")[1];
    setOnboarded(stage === "onboarded");
  }, []);

  if (!onboarded) return null;
  return <TabDock />;
}
