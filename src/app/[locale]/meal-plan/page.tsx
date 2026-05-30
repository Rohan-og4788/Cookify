"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  MealPlanCalendar,
  ShoppingList,
} from "@/components/meal-plan/meal-plan-calendar";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import { useState } from "react";
import type { MealPlanItemDTO, RecipeDTO, PaginatedResponse } from "@/types";

export default function MealPlanPage() {
  const t = useTranslations("mealPlan");
  const [search, setSearch] = useState("");

  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ["meal-plan"],
    queryFn: async () => {
      const res = await fetch("/api/meal-plan");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{
        id: string;
        items: MealPlanItemDTO[];
      }>;
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["meal-plan-search", search],
    queryFn: async () => {
      if (!search) return { data: [] };
      const res = await fetch(`/api/recipes?q=${encodeURIComponent(search)}`);
      if (!res.ok) return { data: [] };
      return res.json() as Promise<PaginatedResponse<RecipeDTO>>;
    },
    enabled: search.length >= 2,
  });

  const reminderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reminder" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) {
    return <p className="text-center text-muted">Loading meal plan...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button
          variant="outline"
          onClick={() => reminderMutation.mutate()}
          disabled={reminderMutation.isPending}
        >
          {t("sendReminder")}
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search recipes to add..."
      />

      {mealPlan && (
        <>
          <MealPlanCalendar
            items={mealPlan.items}
            mealPlanId={mealPlan.id}
            searchResults={searchResults?.data ?? []}
          />
          <ShoppingList mealPlanId={mealPlan.id} />
        </>
      )}
    </div>
  );
}
