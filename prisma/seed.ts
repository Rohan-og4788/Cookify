import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user placeholder (OAuth users created on first sign-in)
  const admin = await prisma.user.upsert({
    where: { email: "admin@recipefinder.dev" },
    create: {
      email: "admin@recipefinder.dev",
      name: "Admin",
      role: "ADMIN",
    },
    update: { role: "ADMIN" },
  });

  // Sample ingredients
  const ingredientNames = [
    "chicken breast",
    "olive oil",
    "garlic",
    "onion",
    "tomato",
    "basil",
    "pasta",
    "parmesan cheese",
    "rice",
    "soy sauce",
    "ginger",
    "bell pepper",
    "black beans",
    "avocado",
    "lime",
    "cilantro",
    "flour",
    "sugar",
    "eggs",
    "butter",
  ];

  const ingredients = await Promise.all(
    ingredientNames.map((name) =>
      prisma.ingredient.upsert({
        where: { name },
        create: { name },
        update: {},
      })
    )
  );

  const ing = (name: string) =>
    ingredients.find((i) => i.name === name)!.id;

  // Sample recipes
  const recipes = [
    {
      title: "Classic Spaghetti Carbonara",
      slug: "classic-spaghetti-carbonara",
      description:
        "A rich and creamy Italian pasta dish with eggs, cheese, and pancetta.",
      imageUrl:
        "https://www.themealdb.com/images/media/meals/llwnc1l1695620494.jpg",
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      servings: 4,
      difficulty: "MEDIUM" as const,
      cuisine: "Italian",
      dietTags: [] as string[],
      allergens: ["eggs", "dairy", "gluten"],
      instructions: [
        { step: 1, text: "Bring a large pot of salted water to boil.", timerMinutes: 5 },
        { step: 2, text: "Cook spaghetti according to package directions until al dente.", timerMinutes: 10 },
        { step: 3, text: "While pasta cooks, whisk eggs with grated parmesan.", timerMinutes: 3 },
        { step: 4, text: "Toss hot pasta with egg mixture off heat, adding pasta water to create creamy sauce.", timerMinutes: 2 },
        { step: 5, text: "Season with black pepper and serve immediately." },
      ],
      nutrition: { calories: 520, protein: 22, carbs: 58, fat: 22 },
      ingredients: [
        { name: "pasta", quantity: 400, unit: "g" },
        { name: "eggs", quantity: 4, unit: "whole" },
        { name: "parmesan cheese", quantity: 100, unit: "g" },
        { name: "garlic", quantity: 2, unit: "cloves" },
      ],
    },
    {
      title: "Vegan Buddha Bowl",
      slug: "vegan-buddha-bowl",
      description:
        "A colorful, nutrient-packed bowl with rice, black beans, and fresh vegetables.",
      imageUrl:
        "https://www.themealdb.com/images/media/meals/yypvqq1511817325.jpg",
      prepTimeMinutes: 20,
      cookTimeMinutes: 25,
      servings: 2,
      difficulty: "EASY" as const,
      cuisine: "American",
      dietTags: ["vegan", "gluten-free"],
      allergens: ["soy"],
      instructions: [
        { step: 1, text: "Cook rice according to package directions.", timerMinutes: 20 },
        { step: 2, text: "Season and roast black beans with cumin and paprika.", timerMinutes: 15 },
        { step: 3, text: "Slice avocado and bell pepper.", timerMinutes: 5 },
        { step: 4, text: "Assemble bowls with rice, beans, vegetables, and cilantro-lime dressing." },
      ],
      nutrition: { calories: 420, protein: 15, carbs: 55, fat: 18 },
      ingredients: [
        { name: "rice", quantity: 1, unit: "cup" },
        { name: "black beans", quantity: 1, unit: "can" },
        { name: "avocado", quantity: 1, unit: "whole" },
        { name: "bell pepper", quantity: 1, unit: "whole" },
        { name: "cilantro", quantity: 0.25, unit: "cup" },
        { name: "lime", quantity: 1, unit: "whole" },
      ],
    },
    {
      title: "Thai Green Curry",
      slug: "thai-green-curry",
      description:
        "Aromatic Thai curry with coconut milk, vegetables, and fragrant herbs.",
      imageUrl:
        "https://www.themealdb.com/images/media/meals/wssvws1511785876.jpg",
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      difficulty: "MEDIUM" as const,
      cuisine: "Thai",
      dietTags: ["gluten-free"],
      allergens: [],
      instructions: [
        { step: 1, text: "Heat oil in a wok and fry curry paste until fragrant.", timerMinutes: 3 },
        { step: 2, text: "Add coconut milk and bring to a gentle simmer.", timerMinutes: 5 },
        { step: 3, text: "Add chicken and cook until done.", timerMinutes: 15 },
        { step: 4, text: "Add vegetables and simmer until tender.", timerMinutes: 10 },
        { step: 5, text: "Garnish with basil and serve with rice." },
      ],
      nutrition: { calories: 380, protein: 28, carbs: 12, fat: 24 },
      ingredients: [
        { name: "chicken breast", quantity: 500, unit: "g" },
        { name: "bell pepper", quantity: 2, unit: "whole" },
        { name: "ginger", quantity: 1, unit: "tbsp" },
        { name: "basil", quantity: 0.5, unit: "cup" },
        { name: "rice", quantity: 2, unit: "cups" },
      ],
    },
    {
      title: "Keto Avocado Egg Bake",
      slug: "keto-avocado-egg-bake",
      description: "Low-carb breakfast bake with eggs baked in avocado halves.",
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 2,
      difficulty: "EASY" as const,
      cuisine: "American",
      dietTags: ["keto", "gluten-free"],
      allergens: ["eggs"],
      instructions: [
        { step: 1, text: "Preheat oven to 425°F (220°C).", timerMinutes: 10 },
        { step: 2, text: "Halve avocados and remove some flesh to make room for eggs." },
        { step: 3, text: "Crack an egg into each avocado half.", timerMinutes: 2 },
        { step: 4, text: "Bake until eggs are set, about 15 minutes.", timerMinutes: 15 },
      ],
      nutrition: { calories: 290, protein: 12, carbs: 8, fat: 24 },
      ingredients: [
        { name: "avocado", quantity: 2, unit: "whole" },
        { name: "eggs", quantity: 2, unit: "whole" },
        { name: "butter", quantity: 1, unit: "tbsp" },
      ],
    },
    {
      title: "Chocolate Lava Cake",
      slug: "chocolate-lava-cake",
      description: "Decadent individual chocolate cakes with molten centers.",
      prepTimeMinutes: 15,
      cookTimeMinutes: 12,
      servings: 4,
      difficulty: "HARD" as const,
      cuisine: "French",
      dietTags: [],
      allergens: ["eggs", "dairy", "gluten"],
      instructions: [
        { step: 1, text: "Preheat oven to 425°F. Butter and flour ramekins.", timerMinutes: 5 },
        { step: 2, text: "Melt chocolate and butter together.", timerMinutes: 3 },
        { step: 3, text: "Whisk eggs, sugar, and fold in chocolate mixture and flour.", timerMinutes: 5 },
        { step: 4, text: "Divide into ramekins and bake 12 minutes.", timerMinutes: 12 },
        { step: 5, text: "Invert onto plates and serve immediately." },
      ],
      nutrition: { calories: 450, protein: 6, carbs: 42, fat: 30 },
      ingredients: [
        { name: "butter", quantity: 100, unit: "g" },
        { name: "eggs", quantity: 3, unit: "whole" },
        { name: "sugar", quantity: 100, unit: "g" },
        { name: "flour", quantity: 50, unit: "g" },
      ],
    },
  ];

  for (const recipeData of recipes) {
    const { ingredients: recipeIngredients, ...recipeFields } = recipeData;

    await prisma.recipe.upsert({
      where: { slug: recipeFields.slug },
      create: {
        ...recipeFields,
        source: "INTERNAL",
        ingredients: {
          create: recipeIngredients.map((ri) => ({
            quantity: ri.quantity,
            unit: ri.unit,
            ingredientId: ing(ri.name),
          })),
        },
      },
      update: {},
    });
  }

  console.log(`Seeded ${recipes.length} recipes and ${ingredients.length} ingredients`);
  console.log(`Admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
