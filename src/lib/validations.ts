import { z } from "zod";

export const searchFiltersSchema = z.object({
  q: z.string().max(200).optional(),
  ingredients: z.array(z.string()).optional(),
  cuisine: z.string().max(50).optional(),
  diet: z.array(z.enum(["vegan", "gluten-free", "keto"])).optional(),
  maxPrepTime: z.number().min(5).max(180).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
});

export const reviewSchema = z.object({
  recipeId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const collectionSchema = z.object({
  name: z.string().min(1).max(100),
});

export const addToCollectionSchema = z.object({
  collectionId: z.string().cuid(),
  recipeId: z.string().cuid(),
});

export const recipeFormSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  prepTimeMinutes: z.coerce.number().min(5).max(480),
  cookTimeMinutes: z.coerce.number().min(0).max(480),
  servings: z.coerce.number().min(1).max(50),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  cuisine: z.string().max(50).optional(),
  dietTags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  instructions: z.array(
    z.object({
      step: z.number(),
      text: z.string().min(1),
      timerMinutes: z.number().optional(),
    })
  ).min(1),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.coerce.number().positive(),
      unit: z.string().min(1),
    })
  ).min(1),
  nutrition: z
    .object({
      calories: z.coerce.number().min(0),
      protein: z.coerce.number().min(0),
      carbs: z.coerce.number().min(0),
      fat: z.coerce.number().min(0),
    })
    .optional(),
});

export const mealPlanItemSchema = z.object({
  recipeId: z.string().cuid(),
  dayOfWeek: z.number().min(0).max(6),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  servings: z.number().min(1).max(50).optional(),
});

export const mealPlanReminderSchema = z.object({
  weekStart: z.string().datetime(),
});

export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type RecipeFormInput = z.infer<typeof recipeFormSchema>;
export type MealPlanItemInput = z.infer<typeof mealPlanItemSchema>;
