"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";

interface PendingReview {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string | null };
  recipe: { title: string };
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error("Forbidden");
      return res.json() as Promise<PendingReview[]>;
    },
  });

  const moderate = useMutation({
    mutationFn: async ({
      reviewId,
      status,
    }: {
      reviewId: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>
      <h2 className="mb-4 text-xl font-semibold">{t("pending")}</h2>

      {isLoading ? (
        <p className="text-muted">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted">{t("noPending")}</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium">{review.recipe.title}</p>
                  <p className="text-sm text-muted">
                    by {review.user.name ?? "Anonymous"}
                  </p>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="mb-4 text-sm">{review.comment}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    moderate.mutate({ reviewId: review.id, status: "APPROVED" })
                  }
                >
                  {t("approve")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    moderate.mutate({ reviewId: review.id, status: "REJECTED" })
                  }
                >
                  {t("reject")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
