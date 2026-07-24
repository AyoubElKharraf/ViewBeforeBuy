"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getMapProperties, type MapProperty } from "@/lib/api";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] client-card rounded-2xl flex items-center justify-center text-sm opacity-60">
      Chargement de la carte…
    </div>
  ),
});

const TYPES = ["Tous", "Villa", "Appartement", "Riad", "Duplex"];

export default function MapPage() {
  const [all, setAll] = useState<MapProperty[]>([]);
  const [type, setType] = useState("Tous");

  useEffect(() => {
    void getMapProperties()
      .then(setAll)
      .catch(() => setAll([]));
  }, []);

  const filtered = type === "Tous" ? all : all.filter((p) => p.type === type);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Carte des biens
        </h1>
        <p className="text-sm opacity-60 mt-1">Explorez le catalogue sur OpenStreetMap</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs border ${
              type === t
                ? "bg-[color:var(--color-client-gold)] text-white border-transparent"
                : "border-[color:var(--color-client-border)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <MapView properties={filtered} height="70vh" />
    </div>
  );
}
