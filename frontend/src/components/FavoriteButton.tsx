"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoriteButton({
  propertyId,
  className = "",
}: {
  propertyId: string;
  className?: string;
}) {
  const { isFavorited, toggleFavorite, loading } = useFavorites();
  const active = isFavorited(propertyId);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleFavorite(propertyId);
      }}
      className={`inline-flex items-center justify-center rounded-full p-2 transition ${
        active ? "text-red-500 bg-red-500/10" : "text-current/50 hover:text-red-500 bg-black/5"
      } ${className}`}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart className={`w-4 h-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
