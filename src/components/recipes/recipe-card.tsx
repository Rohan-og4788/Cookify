"use client";

import { Link } from "@/i18n/routing";
import { Clock, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { StarRating } from "@/components/ui/star-rating";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { RecipeBackground } from "@/components/recipes/recipe-background";
import { formatDuration } from "@/lib/utils";
import type { RecipeDTO } from "@/types";

interface RecipeCardProps {
  recipe: RecipeDTO;
  onSave?: (id: string) => void;
  draggable?: boolean;
}

export function RecipeCard({ recipe, onSave, draggable }: RecipeCardProps) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="recipe-card group overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm ring-1 ring-black/[0.03] transition-[box-shadow,transform] hover:shadow-xl dark:ring-white/[0.04]"
      draggable={draggable}
      data-recipe-id={recipe.id}
    >
      <Link href={`/recipes/${recipe.id}`} className="block">
        <RecipeBackground
          imageUrl={recipe.imageUrl}
          title={recipe.title}
          cuisine={recipe.cuisine}
          alt={recipe.title}
          className="aspect-[4/3]"
          imageClassName="transition-transform duration-500 ease-out group-hover:scale-110"
          overlay="card"
        >
          <div className="flex h-full flex-col justify-between p-3">
            <div className="flex justify-start">
              <DifficultyBadge
                difficulty={recipe.difficulty}
                className="backdrop-blur-sm shadow-sm"
              />
            </div>
            <div className="flex items-end justify-between gap-2">
              {recipe.cuisine && (
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm dark:bg-black/70 dark:text-white">
                  {recipe.cuisine}
                </span>
              )}
              {recipe.avgRating >= 4 && (
                <span className="flex items-center gap-1 rounded-full bg-primary/95 px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                  {recipe.avgRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </RecipeBackground>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={`/recipes/${recipe.id}`}>
            <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
              {recipe.title}
            </h3>
          </Link>
          {onSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSave(recipe.id);
              }}
              className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={recipe.isSaved ? "Remove from saved" : "Save recipe"}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${recipe.isSaved ? "fill-primary text-primary" : "text-muted hover:text-primary"}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {recipe.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted">{recipe.description}</p>
        )}

        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1 rounded-md bg-surface-hover px-2 py-0.5">
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {formatDuration(totalTime)}
          </span>
          <span className="text-xs">
            {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
          <StarRating rating={recipe.avgRating} size="sm" />
          {recipe.reviewCount > 0 && (
            <span className="text-xs text-muted">({recipe.reviewCount} reviews)</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
