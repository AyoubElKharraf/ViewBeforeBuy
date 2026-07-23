"use client";

import { useMemo, useState } from "react";
import { Box, MapPin, Move3d, Search } from "lucide-react";
import type { Property } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import Property3DModal from "@/components/Property3DModal";

const TYPES = ["Tous", "Villa", "Appartement", "Riad", "Duplex"] as const;

export default function LibraryClient({ properties }: { properties: Property[] }) {
  const [type, setType] = useState<string>("Tous");
  const [query, setQuery] = useState("");
  const [view3d, setView3d] = useState<Property | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (type !== "Tous" && p.type !== type) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q)
      );
    });
  }, [properties, type, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Bibliothèque 3D</h1>
        <p className="text-sm text-white/50 mt-1">
          Ouvrez une visite immersive pour chaque bien publié
        </p>
      </div>

      <div className="agency-card rounded-xl p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un bien…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-2 rounded-lg text-xs transition ${
                type === t
                  ? "bg-[color:var(--color-agency-accent)] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="agency-card rounded-xl p-10 text-center">
          <Box className="w-10 h-10 mx-auto text-white/30 mb-3" />
          <div className="text-sm text-white/50">Aucun modèle 3D disponible pour ces filtres.</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <article key={p.id} className="agency-card rounded-xl overflow-hidden flex flex-col">
              <div
                className="aspect-video relative flex items-center justify-center text-4xl"
                style={{
                  background:
                    "radial-gradient(circle at 40% 40%, oklch(0.28 0.06 260), oklch(0.14 0.03 260))",
                }}
              >
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                ) : (
                  <Box className="w-10 h-10 text-[color:var(--color-agency-accent-light)]/70" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-white/80">
                  Scène procédurale 3D
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="flex items-center gap-1 text-xs text-white/50 mt-1">
                  <MapPin className="w-3 h-3" /> {p.city} · {p.type}
                </div>
                <div className="text-sm mt-2 text-[color:var(--color-agency-accent-light)]">
                  {formatPrice(p.price)}
                </div>
                <button
                  type="button"
                  onClick={() => setView3d(p)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[color:var(--color-agency-accent)] text-white text-sm font-medium hover:brightness-110 transition"
                >
                  <Move3d className="w-4 h-4" /> Ouvrir la visite 3D
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Property3DModal
        open={view3d !== null}
        onClose={() => setView3d(null)}
        propertyName={view3d?.name ?? ""}
        accent="#6366f1"
      />
    </div>
  );
}
