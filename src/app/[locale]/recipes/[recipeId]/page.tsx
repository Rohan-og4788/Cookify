import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getRecipeById } from "@/lib/recipes";
import { Link } from "@/i18n/routing";
import { Clock, Users, ChefHat } from "lucide-react";
import { ShareButton } from "@/components/recipes/share-button";
import { StarRating } from "@/components/ui/star-rating";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { IngredientList } from "@/components/recipes/ingredient-list";
import { InstructionSteps } from "@/components/recipes/instruction-steps";
import { NutritionPanel } from "@/components/recipes/nutrition-panel";
import { ReviewsSection } from "@/components/recipes/reviews-section";
import { RecipeDetailActions } from "@/components/recipes/recipe-detail-actions";
import { ServingsAdjuster } from "@/components/recipes/servings-adjuster";
import type { Metadata } from "next";
import type { ReviewDTO } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; recipeId: string }>;
}): Promise<Metadata> {
  const { recipeId } = await params;
  const recipe = await getRecipeById(recipeId);

  if (!recipe) return { title: "Recipe Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title: recipe.title,
    description: recipe.description ?? undefined,
    openGraph: {
      title: recipe.title,
      description: recipe.description ?? undefined,
      images: [`${baseUrl}/api/og/${recipeId}`],
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      images: [`${baseUrl}/api/og/${recipeId}`],
    },
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; recipeId: string }>;
}) {
  const { locale, recipeId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("recipe");

  let session = null;
  try {
    session = await auth();
  } catch {
    // Auth not configured
  }

  const recipe = await getRecipeById(recipeId, session?.user?.id);
  if (!recipe) notFound();

  // Reviews only available from database
  let reviewDTOs: ReviewDTO[] = [];
  if (!recipeId.startsWith("fallback-")) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const reviews = await prisma.review.findMany({
        where: { recipeId, status: "APPROVED" },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      reviewDTOs = reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      }));
    } catch {
      // DB unavailable
    }
  }

  return (
    <article>
      {/* Hero */}
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl bg-surface-hover">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 p-6 text-white sm:p-8">
          <DifficultyBadge difficulty={recipe.difficulty} className="mb-3" />
          <h1 className="text-3xl font-bold sm:text-4xl">{recipe.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <StarRating rating={recipe.avgRating} />
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {recipe.prepTimeMinutes + recipe.cookTimeMinutes} {t("prepTime").toLowerCase()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden="true" />
              {recipe.servings} {t("servings").toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <RecipeDetailActions recipeId={recipe.id} isSaved={recipe.isSaved ?? false} />
        <Link
          href={`/recipes/${recipe.id}/cook`}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90"
        >
          <ChefHat className="h-4 w-4" aria-hidden="true" />
          {t("startCooking")}
        </Link>
        <ShareButton url={`/recipes/${recipe.id}`} title={recipe.title} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Ingredients */}
          <section aria-labelledby="ingredients-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="ingredients-heading" className="text-2xl font-bold">
                {t("ingredients")}
              </h2>
              <ServingsAdjuster originalServings={recipe.servings} />
            </div>
            <IngredientList
              ingredients={recipe.ingredients}
              originalServings={recipe.servings}
            />
          </section>

          {/* Instructions */}
          <section aria-labelledby="instructions-heading">
            <h2 id="instructions-heading" className="mb-4 text-2xl font-bold">
              {t("instructions")}
            </h2>
            <InstructionSteps instructions={recipe.instructions} />
          </section>

          {/* Reviews */}
          {session && (
            <ReviewsSection recipeId={recipe.id} reviews={reviewDTOs} />
          )}
        </div>

        <aside className="space-y-6">
          {/* Nutrition */}
          {recipe.nutrition && (
            <NutritionPanel nutrition={recipe.nutrition} />
          )}

          {/* Allergens */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="mb-3 text-lg font-semibold">{t("allergens")}</h3>
            {recipe.allergens.length > 0 ? (
              <ul className="space-y-1">
                {recipe.allergens.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-sm text-danger"
                  >
                    ⚠ {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t("noAllergens")}</p>
            )}
          </div>

          {/* Diet tags */}
          {recipe.dietTags.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="mb-3 text-lg font-semibold">Diet</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.dietTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
