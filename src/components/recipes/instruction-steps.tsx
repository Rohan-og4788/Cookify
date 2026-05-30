import type { RecipeInstruction } from "@/types";
import { cn } from "@/lib/utils";

interface InstructionStepsProps {
  instructions: RecipeInstruction[];
  className?: string;
}

export function InstructionSteps({ instructions, className }: InstructionStepsProps) {
  return (
    <ol className={cn("space-y-4", className)} aria-label="Cooking instructions">
      {instructions.map((step) => (
        <li
          key={step.step}
          className="rounded-xl border border-border bg-surface p-5 shadow-sm"
        >
          <div className="mb-2 flex items-center gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              aria-hidden="true"
            >
              {step.step}
            </span>
            {step.timerMinutes && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                {step.timerMinutes} min timer
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed sm:text-base">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
