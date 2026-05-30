import createMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/add", "/dashboard", "/meal-plan", "/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Strip locale prefix for path matching
  const pathWithoutLocale = pathname.replace(/^\/(en|es)/, "") || "/";

  const isProtected = protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );

  if (isProtected && !req.auth) {
    const locale = pathname.match(/^\/(en|es)/)?.[1] ?? "en";
    const signInUrl = new URL(`/${locale}/auth/signin`, req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin-only routes
  if (pathWithoutLocale.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    const locale = pathname.match(/^\/(en|es)/)?.[1] ?? "en";
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  return intlMiddleware(req as NextRequest);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
