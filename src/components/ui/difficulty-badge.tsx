import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const styles: Record<Difficulty, string> = {
  EASY: "bg-success/15 text-success",
  MEDIUM: "bg-warning/15 text-warning",
  HARD: "bg-danger/15 text-danger",
};

const labels: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[difficulty],
        className
      )}
    >
      {labels[difficulty]}
    </span>
  );
}
