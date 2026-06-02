/**
 * Backfill missing recipe imageUrl values in PostgreSQL.
 * Run after db:push when recipes were created without images.
 *
 * Usage: npm run db:backfill-images
 */
import { PrismaClient } from "@prisma/client";
import { getRecipeImageUrl } from "../src/lib/recipe-images";

const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany({
    select: { id: true, title: true, cuisine: true, imageUrl: true },
  });

  const missing = recipes.filter((r) => !r.imageUrl?.trim());
  if (missing.length === 0) {
    console.log(`All ${recipes.length} recipes already have images.`);
    return;
  }

  console.log(`Backfilling images for ${missing.length} of ${recipes.length} recipes...`);

  let updated = 0;
  for (const recipe of missing) {
    const imageUrl = getRecipeImageUrl({
      imageUrl: recipe.imageUrl,
      title: recipe.title,
      cuisine: recipe.cuisine,
    });

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imageUrl },
    });
    updated++;
    console.log(`  ✓ ${recipe.title}`);
  }

  console.log(`Done. Updated ${updated} recipe(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
