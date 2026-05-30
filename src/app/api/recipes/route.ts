import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchRecipes } from "@/lib/recipes";
import { searchFiltersSchema, recipeFormSchema } from "@/lib/validations";
import { withRateLimit, getClientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { sanitizeText, sanitizeInput } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const rateLimited = await withRateLimit(getClientIp(request));
  if (rateLimited) return rateLimited;

  const params = request.nextUrl.searchParams;
  const parsed = searchFiltersSchema.safeParse({
    q: params.get("q") ?? undefined,
    ingredients: params.get("ingredients")?.split(",").filter(Boolean),
    cuisine: params.get("cuisine") ?? undefined,
    diet: params.get("diet")?.split(",").filter(Boolean),
    maxPrepTime: params.get("maxPrepTime")
      ? Number(params.get("maxPrepTime"))
      : undefined,
    difficulty: params.get("difficulty") ?? undefined,
    page: params.get("page") ? Number(params.get("page")) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id;
  } catch {
    // Auth not configured — continue without user context
  }

  const results = await searchRecipes(parsed.data, userId);

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const rateLimited = await withRateLimit(getClientIp(request));
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = recipeFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = `${slugify(data.title)}-${Date.now()}`;

  const recipe = await prisma.recipe.create({
    data: {
      title: sanitizeText(data.title),
      slug,
      description: data.description ? sanitizeText(data.description) : null,
      imageUrl: data.imageUrl || null,
      prepTimeMinutes: data.prepTimeMinutes,
      cookTimeMinutes: data.cookTimeMinutes,
      servings: data.servings,
      difficulty: data.difficulty,
      cuisine: data.cuisine ? sanitizeInput(data.cuisine) : null,
      dietTags: data.dietTags ?? [],
      allergens: data.allergens ?? [],
      instructions: data.instructions.map((i) => ({
        ...i,
        text: sanitizeText(i.text),
      })),
      nutrition: data.nutrition ?? undefined,
      source: "USER",
      authorId: session.user.id,
      ingredients: {
        create: await Promise.all(
          data.ingredients.map(async (ing) => {
            const ingredient = await prisma.ingredient.upsert({
              where: { name: ing.name.toLowerCase() },
              create: { name: ing.name.toLowerCase() },
              update: {},
            });
            return {
              quantity: ing.quantity,
              unit: sanitizeInput(ing.unit),
              ingredientId: ingredient.id,
            };
          })
        ),
      },
    },
    include: { ingredients: { include: { ingredient: true } } },
  });

  return NextResponse.json(recipe, { status: 201 });
}
