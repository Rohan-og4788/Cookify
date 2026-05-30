import type { Difficulty, MealType, ReviewStatus, RecipeSource } from "@prisma/client";

export type { Difficulty, MealType, ReviewStatus, RecipeSource };

export interface RecipeInstruction {
  step: number;
  text: string;
  timerMinutes?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeIngredientDTO {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeDTO {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  cuisine: string | null;
  dietTags: string[];
  allergens: string[];
  instructions: RecipeInstruction[];
  nutrition: NutritionInfo | null;
  avgRating: number;
  reviewCount: number;
  source: RecipeSource;
  ingredients: RecipeIngredientDTO[];
  isSaved?: boolean;
}

export interface ReviewDTO {
  id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface CollectionDTO {
  id: string;
  name: string;
  recipeCount: number;
  recipes?: RecipeDTO[];
}

export interface MealPlanItemDTO {
  id: string;
  recipeId: string;
  dayOfWeek: number;
  mealType: MealType;
  servings: number;
  recipe: Pick<RecipeDTO, "id" | "title" | "imageUrl" | "prepTimeMinutes">;
}

export interface SearchFilters {
  q?: string;
  ingredients?: string[];
  cuisine?: string;
  diet?: string[];
  maxPrepTime?: number;
  difficulty?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ShoppingListItem {
  name: string;
  totalQuantity: number;
  unit: string;
}

export const CUISINES = [
  "American",
  "British",
  "Chinese",
  "French",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "Spanish",
  "Thai",
  "Vietnamese",
] as const;

export const DIET_OPTIONS = [
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
  { value: "keto", label: "Keto" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

export const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
