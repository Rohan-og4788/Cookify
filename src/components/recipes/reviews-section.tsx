"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewInput } from "@/lib/validations";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { ReviewDTO } from "@/types";
import { sanitizeText } from "@/lib/sanitize";

interface ReviewsSectionProps {
  recipeId: string;
  reviews: ReviewDTO[];
}

export function ReviewsSection({ recipeId, reviews: initialReviews }: ReviewsSectionProps) {
  const t = useTranslations("recipe");
  const queryClient = useQueryClient();
  const [reviews, setReviews] = useState(initialReviews);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { recipeId, rating: 5 },
  });

  const rating = watch("rating");

  const mutation = useMutation({
    mutationFn: async (data: ReviewInput) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          comment: data.comment ? sanitizeText(data.comment) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json() as Promise<ReviewDTO>;
    },
    onSuccess: (review) => {
      setReviews((prev) => [review, ...prev.filter((r) => r.user.id !== review.user.id)]);
      reset({ recipeId, rating: 5, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
    },
  });

  return (
    <section aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="mb-6 text-2xl font-bold">
        {t("reviews")}
      </h2>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="mb-8 rounded-xl border border-border bg-surface p-6"
      >
        <h3 className="mb-4 font-medium">{t("writeReview")}</h3>
        <StarRating
          rating={rating}
          interactive
          onChange={(r) => setValue("rating", r)}
          size="lg"
          className="mb-4"
        />
        <Input
          {...register("comment")}
          placeholder="Share your experience..."
          className="mb-4"
          aria-invalid={!!errors.comment}
        />
        {errors.comment && (
          <p className="mb-2 text-sm text-danger">{errors.comment.message}</p>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </form>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="mb-2 flex items-center gap-3">
                {review.user.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.user.image}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium">{review.user.name ?? "Anonymous"}</p>
                  <StarRating rating={review.rating} size="sm" />
                </div>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed">{review.comment}</p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
