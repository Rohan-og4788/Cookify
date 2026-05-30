import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";
import { sanitizeText } from "@/lib/sanitize";
import { updateRecipeRating } from "@/lib/recipes";
import { withRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimited = await withRateLimit(getClientIp(request));
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: {
      userId_recipeId: {
        userId: session.user.id,
        recipeId: parsed.data.recipeId,
      },
    },
    create: {
      userId: session.user.id,
      recipeId: parsed.data.recipeId,
      rating: parsed.data.rating,
      comment: parsed.data.comment
        ? sanitizeText(parsed.data.comment)
        : null,
      status: "PENDING",
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment
        ? sanitizeText(parsed.data.comment)
        : null,
      status: "PENDING",
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  await updateRecipeRating(parsed.data.recipeId);

  return NextResponse.json({
    ...review,
    createdAt: review.createdAt.toISOString(),
  });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipeId = request.nextUrl.searchParams.get("recipeId");

  if (recipeId) {
    const reviews = await prisma.review.findMany({
      where: { recipeId, status: "APPROVED" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
    );
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: {
      recipe: { select: { id: true, title: true, imageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}
