/** Cuisine-based food photos (TheMealDB) when a recipe has no imageUrl */
const CUISINE_IMAGES: Record<string, string> = {
  American: "https://www.themealdb.com/images/media/meals/yypvqq1511817325.jpg",
  British: "https://www.themealdb.com/images/media/meals/wssyxw1483689933.jpg",
  Chinese: "https://www.themealdb.com/images/media/meals/bmlw2s1684547973.jpg",
  French: "https://www.themealdb.com/images/media/meals/uqxxw1511639215.jpg",
  Indian: "https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg",
  Italian: "https://www.themealdb.com/images/media/meals/llwnc1l1695620494.jpg",
  Japanese: "https://www.themealdb.com/images/media/meals/1529444113-4610e1503099707.jpg",
  Mexican: "https://www.themealdb.com/images/media/meals/1547592016-4914d1690f94a178529.jpg",
  Spanish: "https://www.themealdb.com/images/media/meals/1550441275.jpg",
  Thai: "https://www.themealdb.com/images/media/meals/wssvws1511785876.jpg",
  Vietnamese: "https://www.themealdb.com/images/media/meals/wssvws1511785876.jpg",
};

const DEFAULT_RECIPE_IMAGE =
  "https://www.themealdb.com/images/media/meals/1547592016-4914d1690f94a178529.jpg";

/** Title keywords → image for recipes without cuisine or stored image */
const TITLE_KEYWORDS: { match: RegExp; url: string }[] = [
  { match: /chocolate|cake|dessert|lava/i, url: "https://www.themealdb.com/images/media/meals/uqxxw1511639215.jpg" },
  { match: /avocado|egg|keto|breakfast/i, url: "https://www.themealdb.com/images/media/meals/1550441275.jpg" },
  { match: /pasta|carbonara|spaghetti/i, url: "https://www.themealdb.com/images/media/meals/llwnc1l1695620494.jpg" },
  { match: /curry|tikka|masala/i, url: "https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg" },
  { match: /vegan|bowl|salad/i, url: "https://www.themealdb.com/images/media/meals/yypvqq1511817325.jpg" },
  { match: /chicken|meat/i, url: "https://www.themealdb.com/images/media/meals/1547592016-4914d1690f94a178529.jpg" },
];

export interface RecipeImageSource {
  imageUrl?: string | null;
  title: string;
  cuisine?: string | null;
}

/** Resolve a display image URL — uses stored URL or a cuisine/title fallback */
export function getRecipeImageUrl(recipe: RecipeImageSource): string {
  if (recipe.imageUrl?.trim()) return recipe.imageUrl.trim();

  if (recipe.cuisine) {
    const byCuisine = CUISINE_IMAGES[recipe.cuisine];
    if (byCuisine) return byCuisine;
  }

  for (const { match, url } of TITLE_KEYWORDS) {
    if (match.test(recipe.title)) return url;
  }

  return DEFAULT_RECIPE_IMAGE;
}

/** Ensure RecipeDTO always has a persisted-quality image URL for API responses */
export function withRecipeImage<T extends RecipeImageSource & { imageUrl: string | null }>(
  recipe: T
): T {
  return {
    ...recipe,
    imageUrl: getRecipeImageUrl(recipe),
  };
}
