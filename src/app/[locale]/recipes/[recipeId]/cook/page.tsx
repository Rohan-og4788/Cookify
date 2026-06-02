import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getRecipeById } from "@/lib/recipes";
import { CookingMode } from "@/components/cooking/cooking-mode";
import type { RecipeInstruction } from "@/types";

export default async function CookPage({
  params,
}: {
  params: Promise<{ locale: string; recipeId: string }>;
}) {
  const { locale, recipeId } = await params;
  setRequestLocale(locale);

  const recipe = await getRecipeById(recipeId);
  if (!recipe) notFound();

  return (
    <CookingMode
      instructions={recipe.instructions as RecipeInstruction[]}
      recipeTitle={recipe.title}
      recipeId={recipe.id}
      imageUrl={recipe.imageUrl}
      cuisine={recipe.cuisine}
    />
  );
}
