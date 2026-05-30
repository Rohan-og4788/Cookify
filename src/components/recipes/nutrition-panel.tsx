import type { NutritionInfo } from "@/types";
import { cn } from "@/lib/utils";

interface NutritionPanelProps {
  nutrition: NutritionInfo;
  className?: string;
}

const macros = [
  { key: "calories" as const, label: "Calories", max: 800, unit: "kcal" },
  { key: "protein" as const, label: "Protein", max: 60, unit: "g" },
  { key: "carbs" as const, label: "Carbs", max: 100, unit: "g" },
  { key: "fat" as const, label: "Fat", max: 50, unit: "g" },
];

export function NutritionPanel({ nutrition, className }: NutritionPanelProps) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-surface p-6", className)}
      aria-label="Nutritional information"
    >
      <h3 className="mb-4 text-lg font-semibold">Nutrition per serving</h3>
      <div className="space-y-4">
        {macros.map(({ key, label, max, unit }) => {
          const value = nutrition[key];
          const pct = Math.min((value / max) * 100, 100);

          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{label}</span>
                <span className="font-medium">
                  {value}
                  {unit}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-surface-hover"
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={`${label}: ${value}${unit}`}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
