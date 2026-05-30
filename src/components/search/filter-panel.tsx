"use client";

import { useTranslations } from "next-intl";
import { useFilterStore } from "@/stores";
import { CUISINES, DIET_OPTIONS, DIFFICULTY_OPTIONS } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface FilterPanelProps {
  onApply: () => void;
  className?: string;
}

export function FilterPanel({ onApply, className }: FilterPanelProps) {
  const t = useTranslations("filters");
  const filters = useFilterStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const res = await fetch("/api/recipes/ingredients");
      if (!res.ok) return [];
      return res.json() as Promise<{ id: string; name: string }[]>;
    },
  });

  const toggleIngredient = (name: string) => {
    const current = filters.ingredients;
    filters.setFilter(
      "ingredients",
      current.includes(name)
        ? current.filter((i) => i !== name)
        : [...current, name]
    );
  };

  const toggleDiet = (value: string) => {
    const current = filters.diet;
    filters.setFilter(
      "diet",
      current.includes(value)
        ? current.filter((d) => d !== value)
        : [...current, value]
    );
  };

  const content = (
    <div className="space-y-6">
      {/* Cuisine */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("cuisine")}</legend>
        <select
          value={filters.cuisine}
          onChange={(e) => filters.setFilter("cuisine", e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t("cuisine")}
        >
          <option value="">All cuisines</option>
          {CUISINES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </fieldset>

      {/* Diet */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("diet")}</legend>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleDiet(value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                filters.diet.includes(value)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-surface-hover"
              )}
              aria-pressed={filters.diet.includes(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Prep time slider */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {t("prepTime")}: {filters.maxPrepTime} min
        </legend>
        <input
          type="range"
          min={5}
          max={180}
          step={5}
          value={filters.maxPrepTime}
          onChange={(e) =>
            filters.setFilter("maxPrepTime", Number(e.target.value))
          }
          className="w-full accent-primary"
          aria-valuemin={5}
          aria-valuemax={180}
          aria-valuenow={filters.maxPrepTime}
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>5 min</span>
          <span>180 min</span>
        </div>
      </fieldset>

      {/* Difficulty */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("difficulty")}</legend>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                filters.setFilter(
                  "difficulty",
                  filters.difficulty === value ? "" : value
                )
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                filters.difficulty === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-surface-hover"
              )}
              aria-pressed={filters.difficulty === value}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Ingredients multi-select */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("ingredients")}</legend>
        <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-2">
          {ingredients.map((ing) => (
            <label
              key={ing.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-surface-hover"
            >
              <input
                type="checkbox"
                checked={filters.ingredients.includes(ing.name)}
                onChange={() => toggleIngredient(ing.name)}
                className="accent-primary"
              />
              <span className="text-sm capitalize">{ing.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            filters.resetFilters();
            onApply();
          }}
        >
          {t("clearAll")}
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            onApply();
            setMobileOpen(false);
          }}
        >
          {t("apply")}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("title")}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        >
          <div
            className="absolute bottom-0 max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={t("title")}
          >
            <h2 className="mb-4 text-lg font-semibold">{t("title")}</h2>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden rounded-xl border border-border bg-surface p-6 lg:block",
          className
        )}
        aria-label={t("title")}
      >
        <h2 className="mb-4 text-lg font-semibold">{t("title")}</h2>
        {content}
      </aside>
    </>
  );
}
