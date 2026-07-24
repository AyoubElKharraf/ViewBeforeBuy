"use client";

import { useCallback, useEffect, useState } from "react";
import { getFavorites, toggleFavorite as apiToggle } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useFavoritesStore } from "@/store/favorites";

export function useFavorites() {
  const { user } = useAuth();
  const { ids, setIds, add, remove, has } = useFavoritesStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    void getFavorites()
      .then((list) => setIds(list.map((p) => p.id)))
      .catch(() => setIds([]));
  }, [user, setIds]);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      const was = has(propertyId);
      if (was) remove(propertyId);
      else add(propertyId);
      setLoading(true);
      try {
        const res = await apiToggle(propertyId);
        if (res.favorited) add(propertyId);
        else remove(propertyId);
        return res.favorited;
      } catch (err) {
        if (was) add(propertyId);
        else remove(propertyId);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [has, add, remove],
  );

  return { ids, count: ids.length, isFavorited: has, toggleFavorite, loading };
}
