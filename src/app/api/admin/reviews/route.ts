import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRecipeRating } from "@/lib/recipes";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reviews = await prisma.review.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      recipe: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(reviews);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reviewId, status } = await request.json();

  if (!reviewId || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { status },
  });

  await updateRecipeRating(review.recipeId);

  return NextResponse.json(review);
}
