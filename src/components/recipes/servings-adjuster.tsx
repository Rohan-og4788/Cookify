"use client";

import { useCookingStore } from "@/stores";
import { useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";
import { useEffect } from "react";

interface ServingsAdjusterProps {
  originalServings: number;
}

export function ServingsAdjuster({ originalServings }: ServingsAdjusterProps) {
  const t = useTranslations("recipe");
  const { servings, setServings } = useCookingStore();

  useEffect(() => {
    setServings(originalServings);
  }, [originalServings, setServings]);

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label={t("adjustServings")}
    >
      <button
        type="button"
        onClick={() => setServings(Math.max(1, servings - 1))}
        className="rounded-lg border border-border p-1.5 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Decrease servings"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[4rem] text-center text-sm font-medium">
        {servings} {t("servings").toLowerCase()}
      </span>
      <button
        type="button"
        onClick={() => setServings(servings + 1)}
        className="rounded-lg border border-border p-1.5 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Increase servings"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
