"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { StarRating } from "@/components/ui/star-rating";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg"
      draggable={draggable}
      data-recipe-id={recipe.id}
    >
      <Link href={`/recipes/${recipe.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-hover">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              No image
            </div>
          )}
          <div className="absolute left-3 top-3">
            <DifficultyBadge difficulty={recipe.difficulty} />
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={`/recipes/${recipe.id}`}>
            <h3 className="line-clamp-2 text-base font-semibold leading-tight hover:text-primary">
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
              className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={recipe.isSaved ? "Remove from saved" : "Save recipe"}
            >
              <Heart
                className={`h-5 w-5 ${recipe.isSaved ? "fill-primary text-primary" : "text-muted"}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatDuration(totalTime)}
          </span>
          {recipe.cuisine && (
            <span className="truncate">{recipe.cuisine}</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={recipe.avgRating} size="sm" />
          {recipe.reviewCount > 0 && (
            <span className="text-xs text-muted">({recipe.reviewCount})</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
