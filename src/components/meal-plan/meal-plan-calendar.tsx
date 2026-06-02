"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { DAY_NAMES, type MealPlanItemDTO, type RecipeDTO } from "@/types";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { getRecipeImageUrl } from "@/lib/recipe-images";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MealPlanCalendarProps {
  items: MealPlanItemDTO[];
  mealPlanId: string;
  searchResults: RecipeDTO[];
}

function DroppableDay({
  dayIndex,
  items,
  onRemove,
}: {
  dayIndex: number;
  items: MealPlanItemDTO[];
  onRemove: (id: string) => void;
}) {
  const t = useTranslations("mealPlan");
  const dayItems = items.filter((i) => i.dayOfWeek === dayIndex);

  return (
    <div
      className="min-h-[120px] rounded-xl border-2 border-dashed border-border bg-surface p-3 transition-colors"
      data-day={dayIndex}
    >
      <h3 className="mb-2 text-sm font-semibold">{DAY_NAMES[dayIndex]}</h3>
      {dayItems.length === 0 ? (
        <p className="text-xs text-muted">{t("emptyDay")}</p>
      ) : (
        <ul className="space-y-2">
          {dayItems.map((item) => (
            <li
              key={item.id}
              className="group relative flex min-h-[52px] items-center justify-between overflow-hidden rounded-lg px-2 py-1.5 text-xs"
              style={{
                backgroundImage: `url(${JSON.stringify(
                  getRecipeImageUrl({
                    imageUrl: item.recipe.imageUrl,
                    title: item.recipe.title,
                    cuisine: null,
                  })
                )})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/55" aria-hidden />
              <span className="relative z-10 truncate font-medium text-white">
                {item.recipe.title}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="relative z-10 ml-1 hidden text-white/90 group-hover:inline focus-visible:inline focus-visible:outline-none"
                aria-label={`Remove ${item.recipe.title}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MealPlanCalendar({
  items,
  mealPlanId,
  searchResults,
}: MealPlanCalendarProps) {
  const t = useTranslations("mealPlan");
  const queryClient = useQueryClient();
  const [activeRecipe, setActiveRecipe] = useState<RecipeDTO | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const addMutation = useMutation({
    mutationFn: async ({
      recipeId,
      dayOfWeek,
    }: {
      recipeId: string;
      dayOfWeek: number;
    }) => {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealPlanId,
          recipeId,
          dayOfWeek,
          mealType: "DINNER",
        }),
      });
      if (!res.ok) throw new Error("Failed to add to meal plan");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plan"] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/meal-plan?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plan"] }),
  });

  const handleDragStart = (event: DragStartEvent) => {
    const recipe = searchResults.find((r) => r.id === event.active.id);
    if (recipe) setActiveRecipe(recipe);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveRecipe(null);
    const { active, over } = event;
    if (!over) return;

    const dayAttr = over.data.current?.day ?? over.id;
    const dayIndex =
      typeof dayAttr === "string" ? parseInt(dayAttr.replace("day-", ""), 10) : dayAttr;

    if (!isNaN(dayIndex as number)) {
      addMutation.mutate({
        recipeId: active.id as string,
        dayOfWeek: dayIndex as number,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <p className="text-sm text-muted">{t("dragHint")}</p>

        {/* Draggable search results */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {searchResults.slice(0, 4).map((recipe) => (
            <div
              key={recipe.id}
              id={recipe.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("recipeId", recipe.id);
              }}
            >
              <RecipeCard recipe={recipe} draggable />
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {DAY_NAMES.map((_, i) => (
            <div
              key={i}
              id={`day-${i}`}
              data-day={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const recipeId = e.dataTransfer.getData("recipeId");
                if (recipeId) {
                  addMutation.mutate({ recipeId, dayOfWeek: i });
                }
              }}
            >
              <DroppableDay
                dayIndex={i}
                items={items}
                onRemove={(id) => removeMutation.mutate(id)}
              />
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeRecipe ? (
          <div className="w-48 opacity-80">
            <RecipeCard recipe={activeRecipe} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface ShoppingListProps {
  mealPlanId: string;
}

export function ShoppingList({ mealPlanId }: ShoppingListProps) {
  const t = useTranslations("mealPlan");
  const [items, setItems] = useState<
    { name: string; totalQuantity: number; unit: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/meal-plan/shopping-list?mealPlanId=${mealPlanId}`
      );
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("shoppingList")}</h3>
        <Button onClick={generate} disabled={loading} size="sm">
          {loading ? "..." : t("generateList")}
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex justify-between rounded-lg bg-surface-hover px-3 py-2 text-sm"
            >
              <span className="capitalize">{item.name}</span>
              <span className="font-medium">
                {item.totalQuantity} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
