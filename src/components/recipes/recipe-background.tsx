import { getRecipeImageUrl, type RecipeImageSource } from "@/lib/recipe-images";
import { cn } from "@/lib/utils";

export type RecipeBackgroundOverlay = "card" | "hero" | "subtle" | "cook" | "none";

const OVERLAY_CLASSES: Record<Exclude<RecipeBackgroundOverlay, "none">, string> = {
  card: "bg-gradient-to-t from-black/75 via-black/25 to-black/5",
  hero: "bg-gradient-to-t from-black/80 via-black/35 to-black/15",
  subtle: "bg-gradient-to-t from-black/55 via-transparent to-transparent",
  cook: "bg-gradient-to-b from-black/70 via-black/40 to-black/70",
};

export interface RecipeBackgroundProps extends RecipeImageSource {
  alt: string;
  className?: string;
  imageClassName?: string;
  overlay?: RecipeBackgroundOverlay;
  children?: React.ReactNode;
}

/** Recipe photo as a CSS background (cover/center) — works for all configured image hosts */
export function RecipeBackground({
  imageUrl,
  title,
  cuisine,
  alt,
  className,
  imageClassName,
  overlay = "card",
  children,
}: RecipeBackgroundProps) {
  const src = getRecipeImageUrl({ imageUrl, title, cuisine });

  return (
    <div className={cn("relative overflow-hidden bg-surface-hover", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat",
          imageClassName
        )}
        style={{ backgroundImage: `url(${JSON.stringify(src)})` }}
        role="img"
        aria-label={alt}
      />
      {overlay !== "none" && (
        <div
          className={cn("pointer-events-none absolute inset-0", OVERLAY_CLASSES[overlay])}
          aria-hidden
        />
      )}
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}
