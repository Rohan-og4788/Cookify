import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekStart } from "@/lib/utils";
import { mealPlanItemSchema } from "@/lib/validations";
import { withRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendMealPlanReminder } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = getWeekStart();

  let mealPlan = await prisma.mealPlan.findUnique({
    where: {
      userId_weekStart: { userId: session.user.id, weekStart },
    },
    include: {
      items: {
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
              prepTimeMinutes: true,
            },
          },
        },
      },
    },
  });

  if (!mealPlan) {
    mealPlan = await prisma.mealPlan.create({
      data: { userId: session.user.id, weekStart },
      include: {
        items: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                prepTimeMinutes: true,
              },
            },
          },
        },
      },
    });
  }

  return NextResponse.json(mealPlan);
}

export async function POST(request: NextRequest) {
  const rateLimited = await withRateLimit(getClientIp(request));
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Send email reminder
  if (body.action === "reminder") {
    const mealPlan = await prisma.mealPlan.findFirst({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { weekStart: "desc" },
    });

    if (session.user.email) {
      await sendMealPlanReminder(
        session.user.email,
        session.user.name ?? "Chef",
        mealPlan?.weekStart.toLocaleDateString() ?? "this week",
        mealPlan?.items.length ?? 0
      );
    }

    return NextResponse.json({ sent: true });
  }

  const parsed = mealPlanItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const mealPlanIdFromBody = body.mealPlanId as string | undefined;
  const mealPlan = mealPlanIdFromBody
    ? await prisma.mealPlan.findFirst({
        where: { id: mealPlanIdFromBody, userId: session.user.id },
      })
    : await prisma.mealPlan.findUnique({
        where: {
          userId_weekStart: {
            userId: session.user.id,
            weekStart: getWeekStart(),
          },
        },
      });

  if (!mealPlan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  const item = await prisma.mealPlanItem.create({
    data: {
      mealPlanId: mealPlan.id,
      recipeId: parsed.data.recipeId,
      dayOfWeek: parsed.data.dayOfWeek,
      mealType: parsed.data.mealType,
      servings: parsed.data.servings ?? 4,
    },
    include: {
      recipe: {
        select: { id: true, title: true, imageUrl: true, prepTimeMinutes: true },
      },
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const itemId = request.nextUrl.searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  await prisma.mealPlanItem.deleteMany({
    where: {
      id: itemId,
      mealPlan: { userId: session.user.id },
    },
  });

  return NextResponse.json({ deleted: true });
}
