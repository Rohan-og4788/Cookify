import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizes = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" };

export function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`Rating: ${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(rating);
        const star = (
          <Star
            className={cn(
              sizes[size],
              filled ? "fill-warning text-warning" : "text-border"
            )}
            aria-hidden="true"
          />
        );

        if (interactive && onChange) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              role="radio"
              aria-checked={i + 1 === rating}
              aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
            >
              {star}
            </button>
          );
        }

        return <span key={i}>{star}</span>;
      })}
    </div>
  );
}
