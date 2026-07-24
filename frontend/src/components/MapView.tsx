"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { MapProperty } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import "leaflet/dist/leaflet.css";

const TYPE_COLORS: Record<string, string> = {
  Villa: "#3b82f6",
  Appartement: "#22c55e",
  Riad: "#f97316",
  Duplex: "#a855f7",
};

function markerIcon(type: string) {
  const color = TYPE_COLORS[type] ?? "#6366f1";
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 12);
      return;
    }
    map.fitBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
      { padding: [40, 40] },
    );
  }, [map, points]);
  return null;
}

export default function MapView({
  properties,
  height = "100%",
  zoom = 6,
}: {
  properties: MapProperty[];
  height?: string | number;
  zoom?: number;
}) {
  const points = useMemo(
    () =>
      properties
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => ({ lat: p.lat as number, lng: p.lng as number, p })),
    [properties],
  );

  return (
    <div style={{ height, width: "100%" }} className="rounded-xl overflow-hidden z-0">
      <MapContainer
        center={[31.7917, -7.0926]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map(({ lat, lng, p }) => (
          <Marker key={p.id} position={[lat, lng]} icon={markerIcon(p.type)}>
            <Popup>
              <div className="text-sm min-w-[160px]">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">
                  {p.city} · {p.type}
                </div>
                <div className="font-semibold mt-1">{formatPrice(p.price)}</div>
                <Link
                  href={`/client/properties/${p.id}`}
                  className="text-xs text-blue-600 mt-2 inline-block"
                >
                  Voir le bien →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
