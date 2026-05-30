"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChefHat, AlertCircle } from "lucide-react";

interface SignInFormProps {
  hasGoogle: boolean;
  hasGitHub: boolean;
  locale: string;
}

export function SignInForm({ hasGoogle, hasGitHub, locale }: SignInFormProps) {
  const t = useTranslations("auth");
  const hasOAuth = hasGoogle || hasGitHub;
  const callbackUrl = `/${locale}/dashboard`;

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <ChefHat className="mx-auto mb-6 h-16 w-16 text-primary" aria-hidden="true" />
      <h1 className="mb-2 text-2xl font-bold">{t("signInTitle")}</h1>
      <p className="mb-8 text-muted">{t("signInSubtitle")}</p>

      {!hasOAuth ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-left">
          <div className="mb-3 flex items-center gap-2 text-warning">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            <span className="font-medium">OAuth not configured</span>
          </div>
          <p className="text-sm text-muted">
            Add Google or GitHub OAuth credentials to your <code className="rounded bg-surface-hover px-1">.env</code> file.
            You can still browse and read all recipes without signing in.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {hasGoogle && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => signIn("google", { callbackUrl })}
            >
              {t("continueWithGoogle")}
            </Button>
          )}
          {hasGitHub && (
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={() => signIn("github", { callbackUrl })}
            >
              {t("continueWithGitHub")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
