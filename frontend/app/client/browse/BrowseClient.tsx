"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GitCompare, MapPin, Search, Star, X } from "lucide-react";
import { searchProperties, type Property, type SearchParams } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useComparator } from "@/hooks/useComparator";

const TYPES = ["Tous", "Villa", "Appartement", "Riad", "Duplex"] as const;

export default function BrowseClient() {
  return (
    <Suspense fallback={<div className="text-sm opacity-60">Chargement…</div>}>
      <BrowseInner />
    </Suspense>
  );
}

function BrowseInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggle, isSelected } = useComparator();

  const [filters, setFilters] = useState<SearchParams>(() => ({
    city: searchParams.get("city") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    minPrice: num(searchParams.get("minPrice")),
    maxPrice: num(searchParams.get("maxPrice")),
    minSuperficie: num(searchParams.get("minSuperficie")),
    maxSuperficie: num(searchParams.get("maxSuperficie")),
    rooms: num(searchParams.get("rooms")),
    hasPool: searchParams.get("hasPool") === "true" || undefined,
    hasGarden: searchParams.get("hasGarden") === "true" || undefined,
    hasParking: searchParams.get("hasParking") === "true" || undefined,
    page: num(searchParams.get("page")) ?? 1,
    pageSize: 12,
  }));
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ properties: Property[]; total: number }>({
    properties: [],
    total: 0,
  });

  const runSearch = useCallback(async (f: SearchParams) => {
    setLoading(true);
    try {
      const res = await searchProperties(f);
      let props = res.properties;
      if (q.trim()) {
        const needle = q.trim().toLowerCase();
        props = props.filter(
          (p) =>
            p.name.toLowerCase().includes(needle) ||
            p.city.toLowerCase().includes(needle) ||
            p.neighborhood.toLowerCase().includes(needle),
        );
      }
      setResult({ properties: props, total: q.trim() ? props.length : res.total });
    } catch {
      setResult({ properties: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void runSearch(filters);
  }, [filters, runSearch]);

  function applyAndSync(next: SearchParams) {
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === false) return;
      if (k === "pageSize") return;
      params.set(k, String(v));
    });
    if (q) params.set("q", q);
    router.replace(`/client/browse?${params.toString()}`);
  }

  const chips = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (filters.type && filters.type !== "Tous")
      list.push({
        key: "type",
        label: filters.type,
        clear: () => applyAndSync({ ...filters, type: undefined }),
      });
    if (filters.city)
      list.push({
        key: "city",
        label: filters.city,
        clear: () => applyAndSync({ ...filters, city: undefined }),
      });
    if (filters.minPrice != null || filters.maxPrice != null)
      list.push({
        key: "price",
        label: `Prix ${filters.minPrice ?? 0}–${filters.maxPrice ?? "∞"}`,
        clear: () => applyAndSync({ ...filters, minPrice: undefined, maxPrice: undefined }),
      });
    if (filters.minSuperficie != null || filters.maxSuperficie != null)
      list.push({
        key: "superficie",
        label: `m² ${filters.minSuperficie ?? 0}–${filters.maxSuperficie ?? "∞"}`,
        clear: () =>
          applyAndSync({ ...filters, minSuperficie: undefined, maxSuperficie: undefined }),
      });
    if (filters.rooms != null)
      list.push({
        key: "rooms",
        label: `${filters.rooms}+ pièces`,
        clear: () => applyAndSync({ ...filters, rooms: undefined }),
      });
    if (filters.hasPool)
      list.push({
        key: "pool",
        label: "Piscine",
        clear: () => applyAndSync({ ...filters, hasPool: undefined }),
      });
    if (filters.hasGarden)
      list.push({
        key: "garden",
        label: "Jardin",
        clear: () => applyAndSync({ ...filters, hasGarden: undefined }),
      });
    if (filters.hasParking)
      list.push({
        key: "parking",
        label: "Parking",
        clear: () => applyAndSync({ ...filters, hasParking: undefined }),
      });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Catalogue
        </h1>
        <p className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
          {loading ? "Recherche…" : `${result.total} bien${result.total !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] gap-4 space-y-4 lg:space-y-0">
        <aside className="client-card rounded-2xl p-4 space-y-4 h-fit lg:sticky lg:top-20">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 opacity-50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mot-clé…"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest opacity-50 mb-2">Type</div>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    applyAndSync({
                      ...filters,
                      type: t === "Tous" ? undefined : t,
                      page: 1,
                    })
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs border ${
                    (filters.type ?? "Tous") === t
                      ? "bg-[color:var(--color-client-gold)] text-white border-transparent"
                      : "border-[color:var(--color-client-border)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Field
            label="Ville"
            value={filters.city ?? ""}
            onChange={(v) => applyAndSync({ ...filters, city: v || undefined, page: 1 })}
            placeholder="Casablanca…"
          />
          <Range
            label="Prix min"
            value={filters.minPrice ?? 0}
            onChange={(v) => applyAndSync({ ...filters, minPrice: v || undefined, page: 1 })}
            max={10000000}
            step={50000}
          />
          <Range
            label="Prix max"
            value={filters.maxPrice ?? 10000000}
            onChange={(v) => applyAndSync({ ...filters, maxPrice: v || undefined, page: 1 })}
            max={10000000}
            step={50000}
          />
          <Range
            label="Pièces min"
            value={filters.rooms ?? 0}
            onChange={(v) => applyAndSync({ ...filters, rooms: v || undefined, page: 1 })}
            max={10}
            step={1}
          />
          <Range
            label="Superficie min (m²)"
            value={filters.minSuperficie ?? 0}
            onChange={(v) =>
              applyAndSync({ ...filters, minSuperficie: v || undefined, page: 1 })
            }
            max={1000}
            step={10}
          />
          <Range
            label="Superficie max (m²)"
            value={filters.maxSuperficie ?? 1000}
            onChange={(v) =>
              applyAndSync({ ...filters, maxSuperficie: v || undefined, page: 1 })
            }
            max={1000}
            step={10}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(filters.hasPool)}
              onChange={(e) =>
                applyAndSync({ ...filters, hasPool: e.target.checked || undefined, page: 1 })
              }
            />
            Piscine
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(filters.hasGarden)}
              onChange={(e) =>
                applyAndSync({ ...filters, hasGarden: e.target.checked || undefined, page: 1 })
              }
            />
            Jardin
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(filters.hasParking)}
              onChange={(e) =>
                applyAndSync({ ...filters, hasParking: e.target.checked || undefined, page: 1 })
              }
            />
            Parking
          </label>
          <button
            type="button"
            onClick={() => void runSearch(filters)}
            className="w-full py-2 rounded-lg bg-[color:var(--color-client-gold)] text-white text-sm"
          >
            Rechercher
          </button>
        </aside>

        <div className="space-y-3">
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={c.clear}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[color:var(--color-client-gold)]/15"
                >
                  {c.label} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="client-card rounded-2xl h-64 animate-pulse bg-black/5" />
              ))}
            </div>
          ) : result.properties.length === 0 ? (
            <div className="client-card rounded-2xl p-10 text-center text-sm opacity-60">
              Aucun résultat pour ces filtres.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {result.properties.map((p) => (
                <article key={p.id} className="client-card rounded-2xl overflow-hidden flex flex-col">
                  <Link href={`/client/properties/${p.id}`} className="aspect-video relative bg-black/5">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                    )}
                    <div className="absolute top-2 right-2">
                      <FavoriteButton propertyId={p.id} />
                    </div>
                  </Link>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/client/properties/${p.id}`} className="font-medium truncate">
                        {p.name}
                      </Link>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--color-client-gold)]/15 shrink-0">
                        {p.type}
                      </span>
                    </div>
                    <div className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {p.city}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-semibold text-sm">{formatPrice(p.price)}</div>
                      {p.avgRating != null && (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-[color:var(--color-client-gold)] text-[color:var(--color-client-gold)]" />
                          {p.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-50 mt-1">
                      {p.rooms} pièces · {p.superficie} m²
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      className={`mt-3 text-xs inline-flex items-center justify-center gap-1 py-2 rounded-lg border ${
                        isSelected(p.id)
                          ? "border-[color:var(--color-client-gold)] text-[color:var(--color-client-gold)]"
                          : "border-[color:var(--color-client-border)]"
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      {isSelected(p.id) ? "Sélectionné" : "Comparer"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function num(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs opacity-50">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-[color:var(--color-client-border)] bg-white/60 px-2 py-1.5 text-sm"
      />
    </label>
  );
}

function Range({
  label,
  value,
  onChange,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  step: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs opacity-50 flex justify-between">
        {label} <span>{value}</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[color:var(--color-client-gold)]"
      />
    </label>
  );
}
