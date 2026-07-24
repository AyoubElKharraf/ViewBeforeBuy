"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getFavorites, type Property } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import { FavoriteButton } from "@/components/FavoriteButton";

export default function FavoritesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getFavorites()
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Mes favoris
        </h1>
        <p className="text-sm opacity-60 mt-1">
          {loading ? "…" : `${properties.length} bien${properties.length !== 1 ? "s" : ""}`}
        </p>
      </div>
      {loading ? (
        <div className="client-card rounded-2xl h-40 animate-pulse" />
      ) : properties.length === 0 ? (
        <div className="client-card rounded-2xl p-8 text-center text-sm opacity-60">
          Aucun favori pour le moment.{" "}
          <Link href="/client/browse" className="text-[color:var(--color-client-gold)]">
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {properties.map((p) => (
            <article key={p.id} className="client-card rounded-2xl overflow-hidden">
              <div className="aspect-video relative bg-black/5">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                )}
                <div className="absolute top-2 right-2">
                  <FavoriteButton propertyId={p.id} />
                </div>
              </div>
              <div className="p-3">
                <Link href={`/client/properties/${p.id}`} className="font-medium">
                  {p.name}
                </Link>
                <div className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {p.city}
                </div>
                <div className="font-semibold mt-2">{formatPrice(p.price)}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
