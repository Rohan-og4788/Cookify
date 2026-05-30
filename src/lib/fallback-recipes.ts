import type { RecipeDTO } from "@/types";

/** Built-in recipes with images — used when DB is empty or unavailable */
export const FALLBACK_RECIPES: RecipeDTO[] = [
  {
    id: "fallback-carbonara",
    title: "Classic Spaghetti Carbonara",
    slug: "classic-spaghetti-carbonara",
    description: "Rich Italian pasta with eggs, cheese, and pancetta.",
    imageUrl: "https://www.themealdb.com/images/media/meals/llwnc1l1695620494.jpg",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    difficulty: "MEDIUM",
    cuisine: "Italian",
    dietTags: [],
    allergens: ["eggs", "dairy", "gluten"],
    instructions: [
      { step: 1, text: "Boil salted water and cook spaghetti until al dente.", timerMinutes: 10 },
      { step: 2, text: "Whisk eggs with parmesan cheese." },
      { step: 3, text: "Toss hot pasta with egg mixture off heat." },
    ],
    nutrition: { calories: 520, protein: 22, carbs: 58, fat: 22 },
    avgRating: 4.5,
    reviewCount: 12,
    source: "INTERNAL",
    ingredients: [
      { id: "1", name: "pasta", quantity: 400, unit: "g" },
      { id: "2", name: "eggs", quantity: 4, unit: "whole" },
      { id: "3", name: "parmesan cheese", quantity: 100, unit: "g" },
    ],
  },
  {
    id: "fallback-buddha-bowl",
    title: "Vegan Buddha Bowl",
    slug: "vegan-buddha-bowl",
    description: "Colorful bowl with rice, black beans, and fresh vegetables.",
    imageUrl: "https://www.themealdb.com/images/media/meals/yypvqq1511817325.jpg",
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    servings: 2,
    difficulty: "EASY",
    cuisine: "American",
    dietTags: ["vegan", "gluten-free"],
    allergens: ["soy"],
    instructions: [
      { step: 1, text: "Cook rice according to package directions.", timerMinutes: 20 },
      { step: 2, text: "Season and roast black beans.", timerMinutes: 15 },
      { step: 3, text: "Assemble bowls with rice, beans, and vegetables." },
    ],
    nutrition: { calories: 420, protein: 15, carbs: 55, fat: 18 },
    avgRating: 4.7,
    reviewCount: 8,
    source: "INTERNAL",
    ingredients: [
      { id: "4", name: "rice", quantity: 1, unit: "cup" },
      { id: "5", name: "black beans", quantity: 1, unit: "can" },
      { id: "6", name: "avocado", quantity: 1, unit: "whole" },
    ],
  },
  {
    id: "fallback-green-curry",
    title: "Thai Green Curry",
    slug: "thai-green-curry",
    description: "Aromatic Thai curry with coconut milk and vegetables.",
    imageUrl: "https://www.themealdb.com/images/media/meals/wssvws1511785876.jpg",
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 4,
    difficulty: "MEDIUM",
    cuisine: "Thai",
    dietTags: ["gluten-free"],
    allergens: [],
    instructions: [
      { step: 1, text: "Fry curry paste until fragrant.", timerMinutes: 3 },
      { step: 2, text: "Add coconut milk and simmer.", timerMinutes: 5 },
      { step: 3, text: "Add chicken and vegetables, cook until done.", timerMinutes: 20 },
    ],
    nutrition: { calories: 380, protein: 28, carbs: 12, fat: 24 },
    avgRating: 4.6,
    reviewCount: 15,
    source: "INTERNAL",
    ingredients: [
      { id: "7", name: "chicken breast", quantity: 500, unit: "g" },
      { id: "8", name: "bell pepper", quantity: 2, unit: "whole" },
    ],
  },
  {
    id: "fallback-avocado-egg",
    title: "Keto Avocado Egg Bake",
    slug: "keto-avocado-egg-bake",
    description: "Low-carb breakfast with eggs baked in avocado halves.",
    imageUrl: "https://www.themealdb.com/images/media/meals/1550441275.jpg",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    difficulty: "EASY",
    cuisine: "American",
    dietTags: ["keto", "gluten-free"],
    allergens: ["eggs"],
    instructions: [
      { step: 1, text: "Preheat oven to 425°F.", timerMinutes: 10 },
      { step: 2, text: "Halve avocados and crack an egg into each.", timerMinutes: 2 },
      { step: 3, text: "Bake until eggs are set.", timerMinutes: 15 },
    ],
    nutrition: { calories: 290, protein: 12, carbs: 8, fat: 24 },
    avgRating: 4.3,
    reviewCount: 6,
    source: "INTERNAL",
    ingredients: [
      { id: "9", name: "avocado", quantity: 2, unit: "whole" },
      { id: "10", name: "eggs", quantity: 2, unit: "whole" },
    ],
  },
  {
    id: "fallback-lava-cake",
    title: "Chocolate Lava Cake",
    slug: "chocolate-lava-cake",
    description: "Decadent chocolate cakes with molten centers.",
    imageUrl: "https://www.themealdb.com/images/media/meals/uqxxw1511639215.jpg",
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    servings: 4,
    difficulty: "HARD",
    cuisine: "French",
    dietTags: [],
    allergens: ["eggs", "dairy", "gluten"],
    instructions: [
      { step: 1, text: "Melt chocolate and butter together.", timerMinutes: 3 },
      { step: 2, text: "Whisk eggs and sugar, fold in chocolate.", timerMinutes: 5 },
      { step: 3, text: "Bake in ramekins for 12 minutes.", timerMinutes: 12 },
    ],
    nutrition: { calories: 450, protein: 6, carbs: 42, fat: 30 },
    avgRating: 4.9,
    reviewCount: 22,
    source: "INTERNAL",
    ingredients: [
      { id: "11", name: "butter", quantity: 100, unit: "g" },
      { id: "12", name: "eggs", quantity: 3, unit: "whole" },
      { id: "13", name: "sugar", quantity: 100, unit: "g" },
    ],
  },
  {
    id: "fallback-chicken-tikka",
    title: "Chicken Tikka Masala",
    slug: "chicken-tikka-masala",
    description: "Creamy Indian curry with tender marinated chicken.",
    imageUrl: "https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg",
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    servings: 4,
    difficulty: "MEDIUM",
    cuisine: "Indian",
    dietTags: ["gluten-free"],
    allergens: ["dairy"],
    instructions: [
      { step: 1, text: "Marinate chicken in yogurt and spices.", timerMinutes: 30 },
      { step: 2, text: "Grill or bake chicken until charred.", timerMinutes: 20 },
      { step: 3, text: "Simmer in tomato-cream sauce.", timerMinutes: 20 },
    ],
    nutrition: { calories: 480, protein: 35, carbs: 18, fat: 28 },
    avgRating: 4.8,
    reviewCount: 31,
    source: "INTERNAL",
    ingredients: [
      { id: "14", name: "chicken breast", quantity: 600, unit: "g" },
      { id: "15", name: "tomato", quantity: 400, unit: "g" },
    ],
  },
];

/** Filter fallback recipes in-memory */
export function filterFallbackRecipes(
  filters: {
    q?: string;
    ingredients?: string[];
    cuisine?: string;
    diet?: string[];
    maxPrepTime?: number;
    difficulty?: string;
    page?: number;
    limit?: number;
  }
): { data: RecipeDTO[]; total: number; page: number; totalPages: number } {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;

  let results = [...FALLBACK_RECIPES];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.cuisine?.toLowerCase().includes(q)
    );
  }

  if (filters.cuisine) {
    results = results.filter(
      (r) => r.cuisine?.toLowerCase() === filters.cuisine!.toLowerCase()
    );
  }

  if (filters.difficulty) {
    results = results.filter((r) => r.difficulty === filters.difficulty);
  }

  if (filters.maxPrepTime) {
    results = results.filter((r) => r.prepTimeMinutes <= filters.maxPrepTime!);
  }

  if (filters.diet?.length) {
    results = results.filter((r) =>
      filters.diet!.some((d) => r.dietTags.includes(d))
    );
  }

  if (filters.ingredients?.length) {
    results = results.filter((r) =>
      filters.ingredients!.some((ing) =>
        r.ingredients.some((ri) => ri.name.includes(ing.toLowerCase()))
      )
    );
  }

  const total = results.length;
  const start = (page - 1) * limit;
  const data = results.slice(start, start + limit);

  return { data, total, page, totalPages: Math.ceil(total / limit) || 1 };
}

export function getFallbackRecipeById(id: string): RecipeDTO | null {
  return FALLBACK_RECIPES.find((r) => r.id === id) ?? null;
}

export const FALLBACK_INGREDIENTS = [
  "chicken breast", "olive oil", "garlic", "onion", "tomato", "basil",
  "pasta", "parmesan cheese", "rice", "soy sauce", "ginger", "bell pepper",
  "black beans", "avocado", "lime", "cilantro", "flour", "sugar", "eggs", "butter",
].map((name, i) => ({ id: `fb-ing-${i}`, name }));
