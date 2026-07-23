"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star, MapPin, Search, ArrowRight, Loader2, Move3d, Sparkles } from "lucide-react";
import { ApiError, createCheckout, getToken, type Property } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import Property3DModal from "@/components/Property3DModal";
import { useAuth } from "@/lib/auth";

export default function ClientHomeClient({ properties }: { properties: Property[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view3d, setView3d] = useState<Property | null>(null);

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
        <p className="text-sm text-[color:var(--color-client-text-muted)]">
          Bonjour{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </p>
        <h1 className="text-3xl font-semibold mt-1" style={{ fontFamily: "var(--font-serif)" }}>
          Trouvez votre <em className="text-[color:var(--color-client-gold)]">chez-vous</em>
        </h1>
      </div>

      <Link
        href="/client/ai-assistant"
        className="client-card rounded-2xl p-4 flex items-center gap-3 hover:border-[color:var(--color-client-gold)]/40 transition"
      >
        <div className="w-11 h-11 rounded-xl bg-[color:var(--color-client-gold)]/15 text-[color:var(--color-client-gold)] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm">Copilote Immobilier IA</div>
          <div className="text-xs text-[color:var(--color-client-text-muted)] truncate">
            Posez vos questions sur les biens et le financement
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[color:var(--color-client-gold)] shrink-0" />
      </Link>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = search.trim();
          router.push(q ? `/client/browse?q=${encodeURIComponent(q)}` : "/client/browse");
        }}
        className="client-card rounded-2xl p-4 flex items-center gap-3"
      >
        <Search className="w-5 h-5 text-[color:var(--color-client-text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un bien..."
          className="flex-1 bg-transparent focus:outline-none text-sm text-[color:var(--color-client-text)] placeholder:text-[color:var(--color-client-text-muted)]"
        />
      </form>

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
                  <div className="mt-3 flex gap-2">
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
                          <Loader2 className="w-4 h-4 animate-spin" /> Redirection...
                        </>
                      ) : (
                        "Réserver"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/client/simulator"
          className="client-card rounded-2xl p-5 hover:border-[color:var(--color-client-gold)]/40 transition"
        >
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-client-gold)] mb-2">
            Financement
          </div>
          <div className="font-medium">Simulateur de crédit</div>
          <div className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
            Mensualités, banques marocaines et optimisation IA
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs text-[color:var(--color-client-gold)]">
            Lancer une simulation <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/client/score"
          className="client-card rounded-2xl p-5 hover:border-[color:var(--color-client-gold)]/40 transition"
        >
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-client-gold)] mb-2">
            Éligibilité
          </div>
          <div className="font-medium">Score BAM (33 %)</div>
          <div className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
            Capacité d'emprunt et conseils d'optimisation
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs text-[color:var(--color-client-gold)]">
            Calculer mon score <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </section>

      {properties[0] && (
        <section className="rounded-2xl p-5 bg-gradient-to-br from-[color:var(--color-client-gold)]/15 to-transparent border border-[color:var(--color-client-gold)]/30">
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-client-gold)] mb-2">
            Bien en vedette
          </div>
          <div className="font-medium">
            {properties[0].name} — {properties[0].city}
          </div>
          <div className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
            {formatPrice(properties[0].price)} · Score localisation {properties[0].locationScore}/10
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/client/browse"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-client-gold)] text-white text-sm hover:brightness-110"
            >
              Voir le catalogue <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/client/ai-assistant"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[color:var(--color-client-gold)]/40 text-[color:var(--color-client-gold)] text-sm hover:bg-[color:var(--color-client-gold)]/10"
            >
              Demander à l'IA
            </Link>
          </div>
        </section>
      )}

      <Property3DModal
        open={view3d !== null}
        onClose={() => setView3d(null)}
        propertyName={view3d?.name ?? ""}
        accent="#c9a227"
      />
    </div>
  );
}
