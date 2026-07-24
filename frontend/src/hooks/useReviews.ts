"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteReview as apiDelete,
  getReviews,
  upsertReview,
  type Review,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function useReviews(propertyId: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getReviews(propertyId);
      setReviews(list);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = useCallback(
    async (rating: number, comment?: string) => {
      const review = await upsertReview(propertyId, { rating, comment });
      setReviews((prev) => {
        const without = prev.filter((r) => r.userId !== review.userId);
        return [review, ...without];
      });
      return review;
    },
    [propertyId],
  );

  const remove = useCallback(async (id: string) => {
    await apiDelete(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const mine = user ? reviews.find((r) => r.userId === user.id) : undefined;

  return { reviews, loading, submit, remove, mine, refresh };
}
