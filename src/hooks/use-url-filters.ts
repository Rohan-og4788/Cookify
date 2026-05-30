"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFilterStore } from "@/stores";
import { buildFilterUrl } from "@/lib/utils";

/** Sync filter state with URL search params */
export function useUrlFilters(basePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useFilterStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    filters.setFilter("q", searchParams.get("q") ?? "");
    filters.setFilter(
      "ingredients",
      searchParams.get("ingredients")?.split(",").filter(Boolean) ?? []
    );
    filters.setFilter("cuisine", searchParams.get("cuisine") ?? "");
    filters.setFilter(
      "diet",
      searchParams.get("diet")?.split(",").filter(Boolean) ?? []
    );
    filters.setFilter(
      "maxPrepTime",
      Number(searchParams.get("maxPrepTime") ?? 180)
    );
    filters.setFilter("difficulty", searchParams.get("difficulty") ?? "");
    setIsInitialized(true);
  }, [searchParams, isInitialized, filters]);

  const updateUrl = useCallback(() => {
    const url = buildFilterUrl(basePath, {
      q: filters.q,
      ingredients: filters.ingredients,
      cuisine: filters.cuisine,
      diet: filters.diet,
      maxPrepTime: filters.maxPrepTime,
      difficulty: filters.difficulty,
      page: 1,
    });
    router.push(url, { scroll: false });
  }, [router, basePath, filters]);

  return { filters, updateUrl, isInitialized };
}

/** Debounced value hook */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
