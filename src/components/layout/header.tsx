"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useSession, signOut } from "next-auth/react";
import { ChefHat, Menu, X, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("appName") },
    { href: "/meal-plan", label: t("mealPlan"), protected: true },
    { href: "/dashboard", label: t("dashboard"), protected: true },
    { href: "/add", label: t("addRecipe"), protected: true },
  ];

  const otherLocale = locale === "en" ? "es" : "en";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <ChefHat className="h-7 w-7" aria-hidden="true" />
          <span className="hidden sm:inline">{t("appName")}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navLinks.slice(1).map((link) =>
            !link.protected || session ? (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href && "text-primary"
                )}
              >
                {link.label}
              </Link>
            ) : null
          )}
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/admin" && "text-primary"
              )}
            >
              {t("admin")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={pathname}
            locale={otherLocale}
            className="flex items-center gap-1 rounded-lg p-2 text-sm text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Switch to ${otherLocale === "en" ? "English" : "Spanish"}`}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span className="uppercase">{otherLocale}</span>
          </Link>

          <ThemeToggle className="hidden sm:flex" />

          {session ? (
            <div className="hidden items-center gap-2 md:flex">
              {session.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                {t("signOut")}
              </Button>
            </div>
          ) : (
            <Link href="/auth/signin" className="hidden md:block">
              <Button size="sm">{t("signIn")}</Button>
            </Link>
          )}

          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="border-t border-border bg-surface px-4 py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mb-4 flex justify-center">
            <ThemeToggle />
          </div>
          {navLinks.map((link) =>
            !link.protected || session ? (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : null
          )}
          {session ? (
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => signOut()}
            >
              {t("signOut")}
            </Button>
          ) : (
            <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
              <Button className="mt-2 w-full">{t("signIn")}</Button>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
