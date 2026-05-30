import { prisma } from "@/lib/prisma";
import type { RecipeInstruction, NutritionInfo, RecipeDTO } from "@/types";
import type { Prisma } from "@prisma/client";

const THEMEALDB_URL =
  process.env.THEMEALDB_API_URL ?? "https://www.themealdb.com/api/json/v1/1";

/** Cache API response in PostgreSQL */
async function getCached<T>(key: string): Promise<T | null> {
  const cached = await prisma.apiCache.findUnique({ where: { key } });
  if (!cached || cached.expiresAt < new Date()) {
    if (cached) await prisma.apiCache.delete({ where: { key } }).catch(() => {});
    return null;
  }
  return cached.data as T;
}

async function setCache(key: string, data: unknown, ttlHours = 24) {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  await prisma.apiCache.upsert({
    where: { key },
    create: { key, data: data as Prisma.InputJsonValue, expiresAt },
    update: { data: data as Prisma.InputJsonValue, expiresAt },
  });
}

/** Fetch from TheMealDB with caching */
async function fetchMealDB<T>(endpoint: string): Promise<T | null> {
  const cacheKey = `themealdb:${endpoint}`;
  const cached = await getCached<T>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${THEMEALDB_URL}/${endpoint}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    await setCache(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  [key: string]: string | null;
}

/** Parse TheMealDB meal into our recipe format */
function parseMealDBMeal(meal: MealDBMeal) {
  const ingredients: { name: string; quantity: number; unit: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name?.trim()) {
      const parsed = parseMeasure(measure ?? "");
      ingredients.push({ name: name.trim(), ...parsed });
    }
  }

  const instructionLines = meal.strInstructions
    .split(/\r?\n/)
    .filter((line) => line.trim());

  const instructions: RecipeInstruction[] = instructionLines.map((text, i) => ({
    step: i + 1,
    text: text.trim(),
    timerMinutes: extractTimer(text),
  }));

  return {
    externalId: meal.idMeal,
    title: meal.strMeal,
    description: `${meal.strArea} ${meal.strCategory} cuisine`,
    imageUrl: meal.strMealThumb,
    prepTimeMinutes: 30,
    cookTimeMinutes: 45,
    servings: 4,
    difficulty: "MEDIUM" as const,
    cuisine: meal.strArea,
    dietTags: [] as string[],
    allergens: [] as string[],
    instructions,
    ingredients,
    nutrition: {
      calories: 400,
      protein: 20,
      carbs: 45,
      fat: 15,
    } satisfies NutritionInfo,
  };
}

function parseMeasure(measure: string): { quantity: number; unit: string } {
  const match = measure.trim().match(/^([\d./]+)\s*(.*)$/);
  if (!match) return { quantity: 1, unit: measure.trim() || "unit" };
  const qty = evalFraction(match[1]);
  return { quantity: qty, unit: match[2].trim() || "unit" };
}

function evalFraction(str: string): number {
  if (str.includes("/")) {
    const [num, den] = str.split("/").map(Number);
    return den ? num / den : num;
  }
  return Number(str) || 1;
}

function extractTimer(text: string): number | undefined {
  const match = text.match(/(\d+)\s*(?:min|minute)/i);
  return match ? Number(match[1]) : undefined;
}

/** Sync external recipe to database */
export async function syncMealDBRecipe(externalId: string) {
  const existing = await prisma.recipe.findUnique({
    where: { externalId },
    include: { ingredients: { include: { ingredient: true } } },
  });
  if (existing) return mapRecipeToDTO(existing);

  const data = await fetchMealDB<{ meals: MealDBMeal[] | null }>(
    `lookup.php?i=${externalId}`
  );
  const meal = data?.meals?.[0];
  if (!meal) return null;

  const parsed = parseMealDBMeal(meal);
  const slug = `${parsed.title.toLowerCase().replace(/[^\w]+/g, "-")}-${externalId}`;

  const recipe = await prisma.recipe.create({
    data: {
      externalId,
      source: "THEMEALDB",
      title: parsed.title,
      slug,
      description: parsed.description,
      imageUrl: parsed.imageUrl,
      prepTimeMinutes: parsed.prepTimeMinutes,
      cookTimeMinutes: parsed.cookTimeMinutes,
      servings: parsed.servings,
      difficulty: parsed.difficulty,
      cuisine: parsed.cuisine,
      dietTags: parsed.dietTags,
      allergens: parsed.allergens,
      instructions: parsed.instructions as unknown as Prisma.InputJsonValue,
      nutrition: parsed.nutrition as unknown as Prisma.InputJsonValue,
      cachedAt: new Date(),
      ingredients: {
        create: await Promise.all(
          parsed.ingredients.map(async (ing) => {
            const ingredient = await prisma.ingredient.upsert({
              where: { name: ing.name.toLowerCase() },
              create: { name: ing.name.toLowerCase() },
              update: {},
            });
            return {
              quantity: ing.quantity,
              unit: ing.unit,
              ingredientId: ingredient.id,
            };
          })
        ),
      },
    },
    include: { ingredients: { include: { ingredient: true } } },
  });

  return mapRecipeToDTO(recipe);
}

/** Search TheMealDB and sync results */
export async function searchExternalRecipes(query: string) {
  const data = await fetchMealDB<{ meals: MealDBMeal[] | null }>(
    `search.php?s=${encodeURIComponent(query)}`
  );
  if (!data?.meals) return [];

  const synced = await Promise.all(
    data.meals.slice(0, 10).map((m) => syncMealDBRecipe(m.idMeal))
  );
  return synced.filter(Boolean) as RecipeDTO[];
}

/** Map Prisma recipe to DTO */
export function mapRecipeToDTO(
  recipe: Prisma.RecipeGetPayload<{
    include: { ingredients: { include: { ingredient: true } } };
  }>,
  isSaved = false
): RecipeDTO {
  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine,
    dietTags: recipe.dietTags,
    allergens: recipe.allergens,
    instructions: recipe.instructions as unknown as RecipeInstruction[],
    nutrition: recipe.nutrition as unknown as NutritionInfo | null,
    avgRating: recipe.avgRating,
    reviewCount: recipe.reviewCount,
    source: recipe.source,
    ingredients: recipe.ingredients.map((ri) => ({
      id: ri.id,
      name: ri.ingredient.name,
      quantity: ri.quantity,
      unit: ri.unit,
    })),
    isSaved,
  };
}
