import { setRequestLocale } from "next-intl/server";
import { HomePageClient } from "@/components/home/home-page-client";
import { searchRecipes } from "@/lib/recipes";
import type { PaginatedResponse, RecipeDTO } from "@/types";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Server-side fetch so recipes with images appear immediately
  let initialRecipes: PaginatedResponse<RecipeDTO>;
  try {
    initialRecipes = await searchRecipes({ page: 1, limit: 12 });
  } catch {
    initialRecipes = { data: [], total: 0, page: 1, totalPages: 0 };
  }

  return <HomePageClient initialData={initialRecipes} />;
}
