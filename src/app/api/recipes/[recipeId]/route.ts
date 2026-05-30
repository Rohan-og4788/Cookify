import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecipeById } from "@/lib/recipes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  const { recipeId } = await params;
  const session = await auth();
  const recipe = await getRecipeById(recipeId, session?.user?.id);

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  return NextResponse.json(recipe);
}
