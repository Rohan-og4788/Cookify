"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeFormSchema, type RecipeFormInput } from "@/lib/validations";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/routing";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AddRecipePage() {
  const t = useTranslations("addRecipe");
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormInput>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      prepTimeMinutes: 30,
      cookTimeMinutes: 30,
      servings: 4,
      difficulty: "MEDIUM",
      dietTags: [],
      allergens: [],
      instructions: [{ step: 1, text: "" }],
      ingredients: [{ name: "", quantity: 1, unit: "cup" }],
    },
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ control, name: "instructions" });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" });

  const onSubmit = async (data: RecipeFormInput) => {
    setError("");
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          instructions: data.instructions.map((inst, i) => ({
            ...inst,
            step: i + 1,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create recipe");
      }
      const recipe = await res.json();
      router.push(`/recipes/${recipe.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <Input {...register("title")} aria-invalid={!!errors.title} />
          {errors.title && (
            <p className="mt-1 text-sm text-danger">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Prep (min)</label>
            <Input type="number" {...register("prepTimeMinutes")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Cook (min)</label>
            <Input type="number" {...register("cookTimeMinutes")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Servings</label>
            <Input type="number" {...register("servings")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Difficulty</label>
            <select
              {...register("difficulty")}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Cuisine</label>
          <Input {...register("cuisine")} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <Input {...register("imageUrl")} type="url" />
        </div>

        {/* Ingredients */}
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Ingredients</legend>
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="mb-2 flex gap-2">
              <Input
                {...register(`ingredients.${index}.name`)}
                placeholder="Name"
                className="flex-1"
              />
              <Input
                {...register(`ingredients.${index}.quantity`)}
                type="number"
                step="0.1"
                className="w-20"
              />
              <Input
                {...register(`ingredients.${index}.unit`)}
                placeholder="Unit"
                className="w-24"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(index)}
                aria-label="Remove ingredient"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendIngredient({ name: "", quantity: 1, unit: "cup" })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add Ingredient
          </Button>
        </fieldset>

        {/* Instructions */}
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Instructions</legend>
          {instructionFields.map((field, index) => (
            <div key={field.id} className="mb-2 flex gap-2">
              <span className="mt-2 text-sm font-medium text-muted">
                {index + 1}.
              </span>
              <textarea
                {...register(`instructions.${index}.text`)}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInstruction(index)}
                aria-label="Remove step"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendInstruction({
                step: instructionFields.length + 1,
                text: "",
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add Step
          </Button>
        </fieldset>

        {/* Nutrition */}
        <fieldset>
          <legend className="mb-3 text-sm font-medium">
            Nutrition (optional)
          </legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input {...register("nutrition.calories")} placeholder="Calories" type="number" />
            <Input {...register("nutrition.protein")} placeholder="Protein (g)" type="number" />
            <Input {...register("nutrition.carbs")} placeholder="Carbs (g)" type="number" />
            <Input {...register("nutrition.fat")} placeholder="Fat (g)" type="number" />
          </div>
        </fieldset>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Publishing..." : t("submit")}
        </Button>
      </form>
    </div>
  );
}
