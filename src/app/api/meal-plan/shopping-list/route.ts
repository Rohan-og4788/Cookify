import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShoppingList } from "@/lib/recipes";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mealPlanId = request.nextUrl.searchParams.get("mealPlanId");
  if (!mealPlanId) {
    return NextResponse.json({ error: "mealPlanId required" }, { status: 400 });
  }

  const mealPlan = await prisma.mealPlan.findFirst({
    where: { id: mealPlanId, userId: session.user.id },
  });

  if (!mealPlan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const list = await generateShoppingList(mealPlanId);
  return NextResponse.json(list);
}
