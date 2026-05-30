import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimited = await withRateLimit(getClientIp(request));
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipeId } = await request.json();
  if (!recipeId) {
    return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  }

  const existing = await prisma.savedRecipe.findUnique({
    where: {
      userId_recipeId: { userId: session.user.id, recipeId },
    },
  });

  if (existing) {
    await prisma.savedRecipe.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedRecipe.create({
    data: { userId: session.user.id, recipeId },
  });

  return NextResponse.json({ saved: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedRecipe.findMany({
    where: { userId: session.user.id },
    include: {
      recipe: { include: { ingredients: { include: { ingredient: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(saved);
}
