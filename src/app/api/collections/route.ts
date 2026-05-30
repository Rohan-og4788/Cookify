import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { collectionSchema, addToCollectionSchema } from "@/lib/validations";
import { sanitizeText } from "@/lib/sanitize";
import { withRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { recipes: true } },
      recipes: {
        include: {
          recipe: {
            include: { ingredients: { include: { ingredient: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    collections.map((c) => ({
      id: c.id,
      name: c.name,
      recipeCount: c._count.recipes,
      recipes: c.recipes.map((cr) => cr.recipe),
    }))
  );
}

export async function POST(request: NextRequest) {
  const rateLimited = await withRateLimit(getClientIp(request));
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Add recipe to collection
  if (body.collectionId && body.recipeId) {
    const parsed = addToCollectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const item = await prisma.collectionRecipe.create({
      data: {
        collectionId: parsed.data.collectionId,
        recipeId: parsed.data.recipeId,
      },
    });
    return NextResponse.json(item, { status: 201 });
  }

  // Create new collection
  const parsed = collectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const collection = await prisma.collection.create({
    data: {
      name: sanitizeText(parsed.data.name),
      userId: session.user.id,
    },
  });

  return NextResponse.json(collection, { status: 201 });
}
