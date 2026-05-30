"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useUrlFilters, useDebounce } from "@/hooks/use-url-filters";
import { useFilterStore } from "@/stores";
import { SearchBar } from "@/components/search/search-bar";
import { FilterPanel } from "@/components/search/filter-panel";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeGridSkeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { PaginatedResponse, RecipeDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";

interface HomePageClientProps {
  initialData: PaginatedResponse<RecipeDTO>;
}

function HomeContent({ initialData }: HomePageClientProps) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { updateUrl, isInitialized } = useUrlFilters("/");
  const store = useFilterStore();
  const debouncedQ = useDebounce(store.q, 300);

  const queryParams = new URLSearchParams();
  if (debouncedQ) queryParams.set("q", debouncedQ);
  if (store.ingredients.length)
    queryParams.set("ingredients", store.ingredients.join(","));
  if (store.cuisine) queryParams.set("cuisine", store.cuisine);
  if (store.diet.length) queryParams.set("diet", store.diet.join(","));
  if (store.maxPrepTime !== 180)
    queryParams.set("maxPrepTime", String(store.maxPrepTime));
  if (store.difficulty) queryParams.set("difficulty", store.difficulty);

  const hasActiveFilters =
    debouncedQ ||
    store.ingredients.length > 0 ||
    store.cuisine ||
    store.diet.length > 0 ||
    store.maxPrepTime !== 180 ||
    store.difficulty;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recipes", queryParams.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/recipes?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      return res.json() as Promise<PaginatedResponse<RecipeDTO>>;
    },
    enabled: isInitialized,
    initialData: !hasActiveFilters && isInitialized ? initialData : undefined,
    placeholderData: (prev) => prev,
  });

  const saveMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const res = await fetch("/api/saved-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes"] }),
  });

  const handleApplyFilters = () => {
    updateUrl();
    refetch();
  };

  const recipes =
    data?.data ??
    (!hasActiveFilters && !isInitialized ? initialData.data : []);
  const showInitialSkeleton =
    !isInitialized && initialData.data.length === 0
      ? true
      : isLoading && recipes.length === 0;

  return (
    <div>
      <section className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted">{t("subtitle")}</p>
      </section>

      <div className="mb-6">
        <SearchBar
          value={store.q}
          onChange={(v) => store.setFilter("q", v)}
          onSubmit={handleApplyFilters}
          placeholder={tc("search")}
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterPanel onApply={handleApplyFilters} className="lg:w-72 lg:shrink-0" />

        <div className="flex-1">
          {showInitialSkeleton ? (
            <RecipeGridSkeleton />
          ) : isError ? (
            <div className="py-20 text-center">
              <p className="mb-4 text-muted">{t("noResults")}</p>
              <Button onClick={() => refetch()}>{tc("retry")}</Button>
            </div>
          ) : recipes.length === 0 ? (
            <p className="py-20 text-center text-muted">{t("noResults")}</p>
          ) : (
            <>
              {hasActiveFilters && (
                <p className="mb-4 text-sm text-muted">
                  {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found
                </p>
              )}
              <div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                aria-live="polite"
              >
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSave={
                      session
                        ? (id) => saveMutation.mutate(id)
                        : undefined
                    }
                  />
                ))}
              </div>

              {data && data.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: data.totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={data.page === i + 1 ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        queryParams.set("page", String(i + 1));
                        updateUrl();
                      }}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function HomePageClient({ initialData }: HomePageClientProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RecipeGridSkeleton />}>
        <HomeContent initialData={initialData} />
      </Suspense>
    </ErrorBoundary>
  );
}
