import { setRequestLocale } from "next-intl/server";
import { SignInForm } from "./signin-form";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const hasGoogle = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const hasGitHub = !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

  return <SignInForm hasGoogle={hasGoogle} hasGitHub={hasGitHub} locale={locale} />;
}
