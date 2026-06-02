"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { RecipeInstruction } from "@/types";
import { cn } from "@/lib/utils";
import { getRecipeImageUrl } from "@/lib/recipe-images";

interface CookingModeProps {
  instructions: RecipeInstruction[];
  recipeTitle: string;
  recipeId: string;
  imageUrl?: string | null;
  cuisine?: string | null;
}

export function CookingMode({
  instructions,
  recipeTitle,
  recipeId,
  imageUrl,
  cuisine,
}: CookingModeProps) {
  const bgImage = getRecipeImageUrl({ imageUrl, title: recipeTitle, cuisine });
  const t = useTranslations("cooking");
  const [step, setStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [initialTimer, setInitialTimer] = useState(0);

  const current = instructions[step];

  useEffect(() => {
    if (current?.timerMinutes) {
      const secs = current.timerMinutes * 60;
      setTimerSeconds(secs);
      setInitialTimer(secs);
    } else {
      setTimerSeconds(0);
      setInitialTimer(0);
    }
    setTimerRunning(false);
  }, [step, current?.timerMinutes]);

  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-label={t("title")}
      aria-modal="true"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${JSON.stringify(bgImage)})` }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-background/85 backdrop-blur-sm" aria-hidden />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border/80 bg-surface/80 px-4 py-4 backdrop-blur-md sm:px-8">
        <div>
          <p className="text-sm text-muted">{recipeTitle}</p>
          <p className="text-lg font-semibold">
            {t("step")} {step + 1} {t("of")} {instructions.length}
          </p>
        </div>
        <Link
          href={`/recipes/${recipeId}`}
          className="rounded-lg p-2 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t("exit")}
        >
          <X className="h-6 w-6" />
        </Link>
      </header>

      {/* Main content - large text for voice-ready interface */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
        <div
          className="max-w-2xl text-center"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-2xl font-bold leading-relaxed sm:text-4xl lg:text-5xl">
            {current?.text}
          </p>
        </div>

        {/* Timer */}
        {initialTimer > 0 && (
          <div className="mt-12 text-center" aria-label={t("timer")}>
            <p
              className={cn(
                "font-mono text-6xl font-bold sm:text-8xl",
                timerSeconds === 0 && timerRunning === false && initialTimer > 0 && timerSeconds !== initialTimer
                  ? "text-primary"
                  : ""
              )}
              role="timer"
              aria-live="off"
            >
              {formatTime(timerSeconds)}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setTimerRunning(!timerRunning)}
                aria-label={timerRunning ? t("pause") : t("start")}
              >
                {timerRunning ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
                <span className="ml-2">{timerRunning ? t("pause") : t("start")}</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setTimerSeconds(initialTimer);
                  setTimerRunning(false);
                }}
                aria-label={t("reset")}
              >
                <RotateCcw className="h-6 w-6" />
                <span className="ml-2">{t("reset")}</span>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <footer className="relative z-10 flex items-center justify-between border-t border-border/80 bg-surface/80 px-4 py-6 backdrop-blur-md sm:px-8">
        <Button
          size="lg"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          aria-label={t("previous")}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="ml-2 hidden sm:inline">{t("previous")}</span>
        </Button>

        <div className="flex gap-2" role="tablist" aria-label="Steps">
          {instructions.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}`}
              onClick={() => setStep(i)}
              className={cn(
                "h-3 w-3 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                i === step ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>

        <Button
          size="lg"
          disabled={step === instructions.length - 1}
          onClick={() => setStep((s) => s + 1)}
          aria-label={t("next")}
        >
          <span className="mr-2 hidden sm:inline">{t("next")}</span>
          <ChevronRight className="h-6 w-6" />
        </Button>
      </footer>
    </div>
  );
}
