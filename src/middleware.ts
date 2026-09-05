import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * The access gate for the student platform.
 *
 * This is UX only. It prevents a flash of gated content and keeps the redirect
 * rule in one place instead of duplicated across four pages. It deliberately
 * does NOT verify the token's signature — the API is the authorization
 * boundary and re-checks both the signature and the database on every request.
 * A middleware-only gate would look protected and not be.
 */

const SESSION_COOKIE = "mind_session";
const ONBOARDING = "/onboarding";
const HOME_TAB = "/today";

// Everything under the (app) route group except onboarding itself.
const PROTECTED = ["/today", "/talk", "/trends", "/me", "/data", "/human"];

function isProtected(pathname: string): boolean {
  return PROTECTED.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

/** Reads the `onb` claim without verifying anything. A forged cookie buys a
 *  render, then the API rejects every call the page makes. */
function looksOnboarded(token: string | undefined): boolean {
  if (!token) return false;
  const payload = token.split(".")[1];
  if (!payload) return false;
  try {
    const normalised = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(normalised)) as {
      onb?: boolean;
      exp?: number;
    };
    if (claims.exp && claims.exp * 1000 < Date.now()) return false;
    return claims.onb === true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const onboarded = looksOnboarded(token);

  if (isProtected(pathname) && !onboarded) {
    const url = request.nextUrl.clone();
    url.pathname = ONBOARDING;
    // So onboarding can send them where they were headed.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // An expired access token on a finished account is not a reason to restart
  // onboarding — the client refreshes on its first API call. Only send a
  // confirmed-onboarded visitor away from the flow.
  if (pathname === ONBOARDING && onboarded) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_TAB;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Public marketing routes never reach this. Static assets and the API proxy
  // are excluded so nothing is minted or redirected by fetching a stylesheet.
  matcher: [
    "/today/:path*",
    "/talk/:path*",
    "/trends/:path*",
    "/me/:path*",
    "/data/:path*",
    "/human/:path*",
    "/onboarding",
  ],
};
