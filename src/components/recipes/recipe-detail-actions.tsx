"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useOfflineStore } from "@/stores";

interface RecipeDetailActionsProps {
  recipeId: string;
  isSaved: boolean;
}

export function RecipeDetailActions({
  recipeId,
  isSaved: initialSaved,
}: RecipeDetailActionsProps) {
  const t = useTranslations("recipe");
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { addOfflineRecipe, removeOfflineRecipe } = useOfflineStore();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/saved-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ saved: boolean }>;
    },
    onSuccess: (data) => {
      if (data.saved) addOfflineRecipe(recipeId);
      else removeOfflineRecipe(recipeId);
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
    },
  });

  if (!session) {
    return (
      <Link href="/auth/signin">
        <Button variant="outline">
          <Heart className="h-4 w-4" aria-hidden="true" />
          {t("saveRecipe")}
        </Button>
      </Link>
    );
  }

  const saved = mutation.data?.saved ?? initialSaved;

  return (
    <Button
      variant={saved ? "primary" : "outline"}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      <Heart
        className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
        aria-hidden="true"
      />
      {saved ? t("unsaveRecipe") : t("saveRecipe")}
    </Button>
  );
}
