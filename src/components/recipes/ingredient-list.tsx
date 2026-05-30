"use client";

import { useCookingStore } from "@/stores";
import { scaleQuantity } from "@/lib/utils";
import type { RecipeIngredientDTO } from "@/types";
import { cn } from "@/lib/utils";

interface IngredientListProps {
  ingredients: RecipeIngredientDTO[];
  originalServings: number;
}

export function IngredientList({ ingredients, originalServings }: IngredientListProps) {
  const { servings, checkedIngredients, toggleIngredient } = useCookingStore();

  return (
    <ul className="space-y-2" aria-label="Ingredients list">
      {ingredients.map((ing) => {
        const qty = scaleQuantity(ing.quantity, originalServings, servings);
        const checked = checkedIngredients.has(ing.id);

        return (
          <li key={ing.id}>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-surface-hover",
                checked && "opacity-50 line-through"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleIngredient(ing.id)}
                className="h-5 w-5 accent-primary"
                aria-label={`Mark ${ing.name} as gathered`}
              />
              <span className="flex-1 capitalize">{ing.name}</span>
              <span className="text-sm font-medium text-muted">
                {qty} {ing.unit}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
