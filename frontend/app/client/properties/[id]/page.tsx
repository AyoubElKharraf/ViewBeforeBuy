"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import { getProperty, type Property } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import { FavoriteButton } from "@/components/FavoriteButton";
import { StarRating } from "@/components/StarRating";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/lib/auth";
import { useComparator } from "@/hooks/useComparator";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-48 client-card rounded-xl animate-pulse" />
  ),
});

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const { toggle, isSelected, canAdd } = useComparator();
  const { reviews, loading: reviewsLoading, submit, remove, mine } = useReviews(id);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    void getProperty(id)
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment ?? "");
    }
  }, [mine]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await submit(rating, comment.trim() || undefined);
      const refreshed = await getProperty(id);
      setProperty(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer l'avis");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="client-card rounded-2xl h-64 animate-pulse" />;
  }

  if (!property) {
    return (
      <div className="client-card rounded-2xl p-8 text-center text-sm opacity-60">
        Bien introuvable.{" "}
        <Link href="/client/browse" className="text-[color:var(--color-client-gold)]">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const inCompare = isSelected(property.id);

  return (
    <div className="space-y-5">
      <Link
        href="/client/browse"
        className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100"
      >
        <ArrowLeft className="w-4 h-4" /> Catalogue
      </Link>

      <div className="client-card rounded-2xl overflow-hidden">
        <div className="aspect-[16/10] bg-black/5 relative">
          {property.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.imageUrl}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
          )}
          <div className="absolute top-3 right-3">
            <FavoriteButton propertyId={property.id} />
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {property.name}
              </h1>
              <div className="text-sm opacity-60 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {property.neighborhood}, {property.city}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-[color:var(--color-client-gold)]">
                {formatPrice(property.price)}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--color-client-gold)]/15">
                {property.type}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <StarRating value={Math.round(property.avgRating ?? 0)} readOnly size="sm" />
            <span className="opacity-60">
              {property.avgRating != null ? property.avgRating.toFixed(1) : "—"} (
              {property.reviewCount ?? 0} avis)
            </span>
          </div>

          <p className="text-sm opacity-80 leading-relaxed">{property.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Meta label="Superficie" value={`${property.superficie} m²`} />
            <Meta label="Pièces" value={String(property.rooms)} />
            <Meta label="SDB" value={String(property.bathrooms)} />
            <Meta label="Étage" value={String(property.floor)} />
            <Meta label="Jardin" value={property.hasGarden ? "Oui" : "Non"} />
            <Meta label="Piscine" value={property.hasPool ? "Oui" : "Non"} />
            <Meta label="Parking" value={property.hasParking ? "Oui" : "Non"} />
            <Meta label="Score" value={String(property.locationScore)} />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={!inCompare && !canAdd}
              onClick={() => toggle(property.id)}
              className={`px-3 py-2 rounded-lg text-xs border ${
                inCompare
                  ? "bg-[color:var(--color-client-gold)] text-white border-transparent"
                  : "border-[color:var(--color-client-border)]"
              }`}
            >
              {inCompare ? "Dans le comparateur" : "Comparer"}
            </button>
            <Link
              href="/client/ai-assistant"
              className="px-3 py-2 rounded-lg text-xs border border-[color:var(--color-client-border)]"
            >
              Demander rapport IA
            </Link>
          </div>
        </div>
      </div>

      {property.lat != null && property.lng != null && (
        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            Localisation
          </h2>
          <MapView properties={[property]} height={220} zoom={13} />
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Avis
        </h2>

        {user?.role === "CLIENT" && (
          <form onSubmit={handleSubmit} className="client-card rounded-2xl p-4 space-y-3">
            <div className="text-sm font-medium">
              {mine ? "Modifier votre avis" : "Laisser un avis"}
            </div>
            <StarRating value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Votre commentaire (optionnel, max 500)"
              className="w-full rounded-xl border border-[color:var(--color-client-border)] bg-transparent px-3 py-2 text-sm"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[color:var(--color-client-gold)] text-white text-sm disabled:opacity-50"
              >
                {saving ? "…" : mine ? "Mettre à jour" : "Publier"}
              </button>
              {mine && (
                <button
                  type="button"
                  onClick={() => void remove(mine.id)}
                  className="px-4 py-2 rounded-lg text-sm text-red-500"
                >
                  Supprimer
                </button>
              )}
            </div>
          </form>
        )}

        {reviewsLoading ? (
          <div className="client-card rounded-2xl h-24 animate-pulse" />
        ) : reviews.length === 0 ? (
          <div className="text-sm opacity-60">Aucun avis pour le moment.</div>
        ) : (
          <ul className="space-y-2">
            {reviews.map((r) => (
              <li key={r.id} className="client-card rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[color:var(--color-client-gold)]/20 flex items-center justify-center text-xs font-semibold">
                    {(r.user.name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {r.user.name ?? "Utilisateur"}
                    </div>
                    <div className="text-[10px] opacity-50">
                      {new Date(r.createdAt).toLocaleDateString("fr-MA")}
                    </div>
                  </div>
                  <StarRating value={r.rating} readOnly size="sm" />
                </div>
                {r.comment && <p className="text-sm mt-2 opacity-80">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-client-border)] px-3 py-2">
      <div className="opacity-50">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}
