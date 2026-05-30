"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const t = useTranslations("recipe");

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${url}`;
    if (navigator.share) {
      await navigator.share({ title, url: fullUrl });
    } else {
      await navigator.clipboard.writeText(fullUrl);
    }
  };

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={handleShare}
      aria-label={t("share")}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      {t("share")}
    </button>
  );
}
