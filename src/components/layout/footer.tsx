import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("common");

  return (
    <footer className="mt-auto border-t border-border bg-surface py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted sm:px-6 lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} {t("appName")}. Built with Next.js,
          Prisma, and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
