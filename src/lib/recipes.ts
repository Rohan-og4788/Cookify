import { prisma } from "@/lib/prisma";
import { mapRecipeToDTO, searchExternalRecipes } from "@/lib/external-api";
import { filterFallbackRecipes, getFallbackRecipeById, FALLBACK_INGREDIENTS } from "@/lib/fallback-recipes";
import type { PaginatedResponse, RecipeDTO, SearchFilters } from "@/types";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

/** Build Prisma where clause from search filters */
function buildWhereClause(filters: SearchFilters): Prisma.RecipeWhereInput {
  const where: Prisma.RecipeWhereInput = {};

  if (filters.q) {
    where.title = { contains: filters.q, mode: "insensitive" };
  }

  if (filters.cuisine) {
    where.cuisine = { equals: filters.cuisine, mode: "insensitive" };
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty as "EASY" | "MEDIUM" | "HARD";
  }

  if (filters.maxPrepTime) {
    where.prepTimeMinutes = { lte: filters.maxPrepTime };
  }

  if (filters.diet?.length) {
    where.dietTags = { hasSome: filters.diet };
  }

  if (filters.ingredients?.length) {
    where.ingredients = {
      some: {
        ingredient: {
          name: { in: filters.ingredients.map((i) => i.toLowerCase()) },
        },
      },
    };
  }

  return where;
}

/** Search recipes with pagination and fallback when DB is empty/unavailable */
export async function searchRecipes(
  filters: SearchFilters,
  userId?: string
): Promise<PaginatedResponse<RecipeDTO>> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? PAGE_SIZE;

  try {
    const where = buildWhereClause(filters);

    let [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: { ingredients: { include: { ingredient: true } } },
        orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    // Sync from external API when searching with no local results
    if (total === 0 && filters.q) {
      await searchExternalRecipes(filters.q).catch(() => {});
      [recipes, total] = await Promise.all([
        prisma.recipe.findMany({
          where,
          include: { ingredients: { include: { ingredient: true } } },
          orderBy: [{ avgRating: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.recipe.count({ where }),
      ]);
    }

    // If DB is empty (no filters), show all local recipes
    if (total === 0 && !filters.q && !filters.cuisine && !filters.difficulty && !filters.diet?.length && !filters.ingredients?.length) {
      [recipes, total] = await Promise.all([
        prisma.recipe.findMany({
          include: { ingredients: { include: { ingredient: true } } },
          orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.recipe.count(),
      ]);
    }

    if (total > 0) {
      let savedIds = new Set<string>();
      if (userId) {
        const saved = await prisma.savedRecipe.findMany({
          where: { userId, recipeId: { in: recipes.map((r) => r.id) } },
          select: { recipeId: true },
        });
        savedIds = new Set(saved.map((s) => s.recipeId));
      }

      return {
        data: recipes.map((r) => mapRecipeToDTO(r, savedIds.has(r.id))),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }
  } catch (error) {
    console.warn("Database unavailable, using fallback recipes:", error);
  }

  return filterFallbackRecipes({ ...filters, page, limit });
}

/** Get recipe by ID with optional saved status */
export async function getRecipeById(
  id: string,
  userId?: string
): Promise<RecipeDTO | null> {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: { include: { ingredient: true } } },
    });

    if (recipe) {
      let isSaved = false;
      if (userId) {
        const saved = await prisma.savedRecipe.findUnique({
          where: { userId_recipeId: { userId, recipeId: id } },
        });
        isSaved = !!saved;
      }
      return mapRecipeToDTO(recipe, isSaved);
    }
  } catch {
    // fall through to fallback
  }

  return getFallbackRecipeById(id);
}

/** Autocomplete recipe names */
export async function autocompleteRecipes(query: string, limit = 8) {
  if (!query || query.length < 2) return [];

  const recipes = await prisma.recipe.findMany({
    where: { title: { contains: query, mode: "insensitive" } },
    select: { id: true, title: true, slug: true, imageUrl: true },
    take: limit,
    orderBy: { avgRating: "desc" },
  });

  if (recipes.length < limit) {
    await searchExternalRecipes(query);
    const more = await prisma.recipe.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      select: { id: true, title: true, slug: true, imageUrl: true },
      take: limit,
    });
    return more;
  }

  return recipes;
}

/** Get all unique ingredient names for filter multi-select */
export async function getAllIngredients() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 200,
    });
    if (ingredients.length > 0) return ingredients;
  } catch {
    // fall through
  }
  return FALLBACK_INGREDIENTS;
}

/** Update recipe average rating after review change */
export async function updateRecipeRating(recipeId: string) {
  const agg = await prisma.review.aggregate({
    where: { recipeId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });
}

/** Generate aggregated shopping list from meal plan */
export async function generateShoppingList(mealPlanId: string) {
  const items = await prisma.mealPlanItem.findMany({
    where: { mealPlanId },
    include: {
      recipe: {
        include: { ingredients: { include: { ingredient: true } } },
      },
    },
  });

  const aggregated = new Map<string, { quantity: number; unit: string }>();

  for (const item of items) {
    const scale = item.servings / item.recipe.servings;
    for (const ri of item.recipe.ingredients) {
      const key = `${ri.ingredient.name}:${ri.unit}`;
      const existing = aggregated.get(key);
      const qty = ri.quantity * scale;
      if (existing) {
        existing.quantity += qty;
      } else {
        aggregated.set(key, { quantity: qty, unit: ri.unit });
      }
    }
  }

  return Array.from(aggregated.entries()).map(([key, val]) => ({
    name: key.split(":")[0],
    totalQuantity: Math.round(val.quantity * 100) / 100,
    unit: val.unit,
  }));
}
