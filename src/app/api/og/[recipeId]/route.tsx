import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  const { recipeId } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { title: true, cuisine: true, prepTimeMinutes: true, avgRating: true },
  });

  if (!recipe) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
          color: "white",
          padding: "40px",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: "bold", textAlign: "center" }}>
          {recipe.title}
        </div>
        <div style={{ fontSize: 24, marginTop: 20, opacity: 0.9 }}>
          {recipe.cuisine} · {recipe.prepTimeMinutes} min · ★ {recipe.avgRating.toFixed(1)}
        </div>
        <div style={{ fontSize: 20, marginTop: 40, opacity: 0.7 }}>
          Cookify
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
