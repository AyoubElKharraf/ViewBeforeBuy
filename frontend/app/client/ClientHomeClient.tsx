"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, MapPin, Search, ArrowRight, Loader2 } from "lucide-react";
import { ApiError, createCheckout, getToken, type Property } from "@/lib/api";
import { formatPrice } from "@/utils/types";

export default function ClientHomeClient({ properties }: { properties: Property[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const message =
        err instanceof ApiError ? err.message : "Erreur lors de la création du paiement.";
      setError(message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-[color:var(--color-client-text-muted)]">Bonjour, Amine 👋</p>
        <h1 className="text-3xl font-semibold mt-1" style={{ fontFamily: "var(--font-serif)" }}>
          Trouvez votre <em className="text-[color:var(--color-client-gold)]">chez-vous</em>
        </h1>
      </div>

      <div className="client-card rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-[color:var(--color-client-text-muted)]" />
        <input
          placeholder="Rechercher un bien..."
          className="flex-1 bg-transparent focus:outline-none text-sm text-[color:var(--color-client-text)] placeholder:text-[color:var(--color-client-text-muted)]"
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
            Biens en vedette
          </h2>
          <Link
            href="/client/browse"
            className="text-xs text-[color:var(--color-client-gold)] inline-flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x">
          {properties.length === 0 ? (
            <div className="client-card rounded-2xl p-6 text-sm text-[color:var(--color-client-text-muted)]">
              Aucun bien disponible pour le moment.
            </div>
          ) : (
            properties.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="w-64 shrink-0 client-card rounded-2xl overflow-hidden snap-start"
              >
                <div
                  className="aspect-video flex items-center justify-center text-4xl"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.88 0.03 65), oklch(0.82 0.04 70))",
                  }}
                >
                  🏠
                </div>
                <div className="p-4">
                  <div className="font-medium text-[color:var(--color-client-text)]">{p.name}</div>
                  <div className="flex items-center gap-1 text-xs text-[color:var(--color-client-text-muted)] mt-0.5">
                    <MapPin className="w-3 h-3" /> {p.city}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-base font-semibold">{formatPrice(p.price)}</div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-[color:var(--color-client-gold)] text-[color:var(--color-client-gold)]" />
                      {p.locationScore}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReserve(p.id)}
                    disabled={pendingId === p.id}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[color:var(--color-client-gold)] text-white text-sm hover:brightness-110 disabled:opacity-60"
                  >
                    {pendingId === p.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Redirection...
                      </>
                    ) : (
                      "Réserver (acompte)"
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </section>

      <section className="client-card rounded-2xl p-5">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-client-gold)] mb-2">
          Crédit actif
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-semibold">
              7 850 DH<span className="text-sm font-normal">/mois</span>
            </div>
            <div className="text-xs text-[color:var(--color-client-text-muted)] mt-1">
              CIH Bank · 4.3% · 25 ans
            </div>
          </div>
          <Link href="/client/simulator" className="text-xs text-[color:var(--color-client-gold)]">
            Détails →
          </Link>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[color:var(--color-client-border)]/60 overflow-hidden">
          <div
            className="h-full bg-[color:var(--color-client-gold)] rounded-full"
            style={{ width: "18%" }}
          />
        </div>
        <div className="text-xs text-[color:var(--color-client-text-muted)] mt-2">
          54 mois payés sur 300
        </div>
      </section>

      <section className="rounded-2xl p-5 bg-gradient-to-br from-[color:var(--color-client-gold)]/15 to-transparent border border-[color:var(--color-client-gold)]/30">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-client-gold)] mb-2">
          Recommandé par l'IA
        </div>
        <div className="font-medium">Appartement Maarif — Casablanca</div>
        <div className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
          Correspond à votre profil financier · Éligibilité 82/100
        </div>
        <Link
          href="/client/simulator"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-client-gold)] text-white text-sm hover:brightness-110"
        >
          Simuler le crédit <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
