"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapRecipeToDTO } from "@/lib/external-api";
import type { RecipeDTO } from "@/types";
import { useState } from "react";
import { StarRating } from "@/components/ui/star-rating";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const queryClient = useQueryClient();
  const [collectionName, setCollectionName] = useState("");

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ["saved-recipes"],
    queryFn: async () => {
      const res = await fetch("/api/saved-recipes");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      return data.map(
        (s: { recipe: Parameters<typeof mapRecipeToDTO>[0] }) =>
          mapRecipeToDTO(s.recipe, true)
      ) as RecipeDTO[];
    },
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createCollection = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setCollectionName("");
    },
  });

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      {/* Saved recipes */}
      <section aria-labelledby="saved-heading">
        <h2 id="saved-heading" className="mb-6 text-2xl font-semibold">
          {t("savedRecipes")}
        </h2>
        {isLoading ? (
          <p className="text-muted">{t("noSaved")}</p>
        ) : saved.length === 0 ? (
          <p className="text-muted">{t("noSaved")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((recipe: RecipeDTO) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      {/* Collections */}
      <section aria-labelledby="collections-heading">
        <h2 id="collections-heading" className="mb-6 text-2xl font-semibold">
          {t("collections")}
        </h2>
        <form
          className="mb-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (collectionName.trim()) {
              createCollection.mutate(collectionName.trim());
            }
          }}
        >
          <Input
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder={t("collectionName")}
            aria-label={t("collectionName")}
          />
          <Button type="submit" disabled={createCollection.isPending}>
            {t("createCollection")}
          </Button>
        </form>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map(
            (col: { id: string; name: string; recipeCount: number }) => (
              <div
                key={col.id}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="font-semibold">{col.name}</h3>
                <p className="text-sm text-muted">
                  {col.recipeCount} recipe{col.recipeCount !== 1 ? "s" : ""}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Review history */}
      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="mb-6 text-2xl font-semibold">
          {t("reviewHistory")}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map(
              (review: {
                id: string;
                rating: number;
                comment: string | null;
                recipe: { title: string };
              }) => (
                <li
                  key={review.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <p className="font-medium">{review.recipe.title}</p>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="mt-1 text-sm text-muted">{review.comment}</p>
                  )}
                </li>
              )
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
