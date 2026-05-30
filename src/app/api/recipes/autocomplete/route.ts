import { NextRequest, NextResponse } from "next/server";
import { autocompleteRecipes } from "@/lib/recipes";
import { withRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const rateLimited = await withRateLimit(getClientIp(request));
  if (rateLimited) return rateLimited;

  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const results = await autocompleteRecipes(q);
  return NextResponse.json(results);
}
