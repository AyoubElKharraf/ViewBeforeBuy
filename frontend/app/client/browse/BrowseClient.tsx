"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star, MapPin, Search, Loader2, Move3d } from "lucide-react";
import { ApiError, createCheckout, getToken, type Property } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import Property3DModal from "@/components/Property3DModal";

const TYPES = ["Tous", "Villa", "Appartement", "Riad", "Duplex"] as const;

export default function BrowseClient({ properties }: { properties: Property[] }) {
  return (
    <Suspense fallback={<div className="text-sm text-[color:var(--color-client-text-muted)]">Chargement…</div>}>
      <BrowseClientInner properties={properties} />
    </Suspense>
  );
}

function BrowseClientInner({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState<string>("Tous");
  const [city, setCity] = useState("Toutes");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view3d, setView3d] = useState<Property | null>(null);

  const cities = useMemo(() => {
    const set = new Set(properties.map((p) => p.city).filter(Boolean));
    return ["Toutes", ...Array.from(set).sort()];
  }, [properties]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (type !== "Tous" && p.type !== type) return false;
      if (city !== "Toutes" && p.city !== city) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    });
  }, [properties, query, type, city]);

  async function handleReserve(propertyId: string) {
    setError(null);
    if (!getToken()) {
      setError("Connectez-vous pour réserver un bien.");
      return;
    }
    setPendingId(propertyId);
    try {
      const { url } = await createCheckout({ propertyId });
      if (url) {
        window.location.href = url;
      } else {
        setError("Impossible de démarrer le paiement.");
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la création du paiement.",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Tous les biens
        </h1>
        <p className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
          {filtered.length} bien{filtered.length !== 1 ? "s" : ""} trouvé
          {filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="client-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-[color:var(--color-client-text-muted)] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, ville, quartier…"
            className="flex-1 bg-transparent focus:outline-none text-sm text-[color:var(--color-client-text)] placeholder:text-[color:var(--color-client-text-muted)]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                type === t
                  ? "bg-[color:var(--color-client-gold)] text-white border-transparent"
                  : "border-[color:var(--color-client-border)] text-[color:var(--color-client-text-muted)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {cities.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCity(c)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                city === c
                  ? "bg-[color:var(--color-client-gold)]/15 text-[color:var(--color-client-gold)] border-[color:var(--color-client-gold)]/40"
                  : "border-[color:var(--color-client-border)] text-[color:var(--color-client-text-muted)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="sm:col-span-2 client-card rounded-2xl p-8 text-center text-sm text-[color:var(--color-client-text-muted)]">
            Aucun bien ne correspond à vos filtres.
          </div>
        ) : (
          filtered.map((p) => (
            <article key={p.id} className="client-card rounded-2xl overflow-hidden flex flex-col">
              <div
                className="aspect-video flex items-center justify-center text-4xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, oklch(0.88 0.03 65), oklch(0.82 0.04 70))",
                }}
              >
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  "🏠"
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="flex items-center gap-1 text-xs text-[color:var(--color-client-text-muted)] mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {p.city} · {p.neighborhood}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--color-client-gold)]/15 text-[color:var(--color-client-gold)] shrink-0">
                    {p.type}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-base font-semibold">{formatPrice(p.price)}</div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-[color:var(--color-client-gold)] text-[color:var(--color-client-gold)]" />
                    {p.locationScore}
                  </div>
                </div>

                <div className="text-xs text-[color:var(--color-client-text-muted)] mt-1">
                  {p.rooms} pièces · {p.superficie} m² · {p.bathrooms} SDB
                </div>

                <div className="mt-auto pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setView3d(p)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-[color:var(--color-client-border)] text-sm hover:bg-black/5"
                  >
                    <Move3d className="w-4 h-4" /> 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReserve(p.id)}
                    disabled={pendingId === p.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[color:var(--color-client-gold)] text-white text-sm hover:brightness-110 disabled:opacity-60"
                  >
                    {pendingId === p.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Redirection…
                      </>
                    ) : (
                      "Réserver"
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <Property3DModal
        open={view3d !== null}
        onClose={() => setView3d(null)}
        propertyName={view3d?.name ?? ""}
        accent="#c9a227"
      />
    </div>
  );
}
