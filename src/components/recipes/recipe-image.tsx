import Image from "next/image";
import { getRecipeImageUrl, type RecipeImageSource } from "@/lib/recipe-images";
import { RecipeBackground } from "@/components/recipes/recipe-background";
import { cn } from "@/lib/utils";
import type { RecipeBackgroundOverlay } from "@/components/recipes/recipe-background";

interface RecipeImageProps extends RecipeImageSource {
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  overlay?: RecipeBackgroundOverlay;
  /** Use CSS background instead of next/image (default when fill=true) */
  asBackground?: boolean;
}

export function RecipeImage({
  imageUrl,
  title,
  cuisine,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  loading = "lazy",
  overlay = "none",
  asBackground,
}: RecipeImageProps) {
  const useBackground = asBackground ?? fill;

  if (useBackground && fill) {
    return (
      <RecipeBackground
        imageUrl={imageUrl}
        title={title}
        cuisine={cuisine}
        alt={alt}
        className={cn("h-full w-full", className)}
        imageClassName="transition-transform duration-500 ease-out group-hover:scale-110"
        overlay={overlay}
      />
    );
  }

  const src = getRecipeImageUrl({ imageUrl, title, cuisine });

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
      />
    );
  }

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-lg", className)}
      style={{
        width: width ?? 40,
        height: height ?? 40,
        backgroundImage: `url(${JSON.stringify(src)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      role="img"
      aria-label={alt}
    />
  );
}
