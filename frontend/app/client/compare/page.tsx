"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { compareProperties, type CompareProperty } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import { useComparator } from "@/hooks/useComparator";
import { FavoriteButton } from "@/components/FavoriteButton";

export default function ComparePage() {
  const { ids, clear } = useComparator();
  const [rows, setRows] = useState<CompareProperty[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setRows([]);
      return;
    }
    setLoading(true);
    void compareProperties(ids)
      .then((res) => setRows(res.properties))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [ids]);

  if (ids.length === 0) {
    return (
      <div className="client-card rounded-2xl p-8 text-center text-sm opacity-60">
        Sélectionnez jusqu&apos;à 3 biens depuis le{" "}
        <Link href="/client/browse" className="text-[color:var(--color-client-gold)]">
          catalogue
        </Link>
        .
      </div>
    );
  }

  const bestPrice = Math.min(...rows.map((r) => r.price));
  const bestRating = Math.max(...rows.map((r) => r.avgRating ?? 0));
  const bestMonthly = Math.min(...rows.map((r) => r.estimatedMonthly));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Comparateur
        </h1>
        <button type="button" onClick={clear} className="text-xs opacity-60">
          Réinitialiser
        </button>
      </div>

      {loading ? (
        <div className="client-card rounded-2xl h-48 animate-pulse" />
      ) : (
        <div className="overflow-x-auto client-card rounded-2xl">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-[color:var(--color-client-border)]">
                <th className="p-3 text-left opacity-50">Critère</th>
                {rows.map((p) => (
                  <th key={p.id} className="p-3 text-left">
                    <Link href={`/client/properties/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    <div className="mt-2">
                      <FavoriteButton propertyId={p.id} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CmpRow label="Prix" values={rows.map((p) => ({ text: formatPrice(p.price), best: p.price === bestPrice }))} />
              <CmpRow label="Type" values={rows.map((p) => ({ text: p.type }))} />
              <CmpRow label="Ville" values={rows.map((p) => ({ text: p.city }))} />
              <CmpRow label="Superficie" values={rows.map((p) => ({ text: `${p.superficie} m²` }))} />
              <CmpRow label="Pièces" values={rows.map((p) => ({ text: String(p.rooms) }))} />
              <CmpRow label="SDB" values={rows.map((p) => ({ text: String(p.bathrooms) }))} />
              <CmpRow label="Jardin" values={rows.map((p) => ({ text: p.hasGarden ? "Oui" : "Non" }))} />
              <CmpRow label="Piscine" values={rows.map((p) => ({ text: p.hasPool ? "Oui" : "Non" }))} />
              <CmpRow label="Parking" values={rows.map((p) => ({ text: p.hasParking ? "Oui" : "Non" }))} />
              <CmpRow
                label="Note"
                values={rows.map((p) => ({
                  text: p.avgRating != null ? p.avgRating.toFixed(1) : "—",
                  best: (p.avgRating ?? 0) === bestRating && bestRating > 0,
                }))}
              />
              <CmpRow
                label="Mensualité estimée"
                values={rows.map((p) => ({
                  text: formatPrice(Math.round(p.estimatedMonthly)),
                  best: p.estimatedMonthly === bestMonthly,
                }))}
              />
              <CmpRow
                label="Score localisation"
                values={rows.map((p) => ({ text: String(p.locationScore) }))}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CmpRow({
  label,
  values,
}: {
  label: string;
  values: { text: string; best?: boolean }[];
}) {
  return (
    <tr className="border-b border-[color:var(--color-client-border)]/60">
      <td className="p-3 opacity-60">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`p-3 ${v.best ? "text-emerald-600 font-semibold" : ""}`}>
          {v.text}
        </td>
      ))}
    </tr>
  );
}
