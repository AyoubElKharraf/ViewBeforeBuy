"use client";

import { useMemo, useRef, useState } from "react";
import { MapPin, Plus, Upload, Loader2 } from "lucide-react";
import { ApiError, getToken, uploadPropertyImage, type Property } from "@/lib/api";
import { formatPrice } from "@/utils/types";
import Property3DModal from "@/components/Property3DModal";

export default function PropertiesClient({ properties }: { properties: Property[] }) {
  const [type, setType] = useState<string>("Tous");
  const [city, setCity] = useState("");

  const filtered = useMemo(
    () =>
      properties.filter(
        (p) =>
          (type === "Tous" || p.type === type) && p.city.toLowerCase().includes(city.toLowerCase()),
      ),
    [properties, type, city],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Mes Biens</h1>
          <p className="text-sm text-white/50 mt-1">{filtered.length} biens actifs</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[color:var(--color-agency-accent)] text-white text-sm font-medium inline-flex items-center gap-2 hover:brightness-110">
          <Plus className="w-4 h-4" /> Ajouter un bien
        </button>
      </div>

      <div className="agency-card rounded-xl p-4 flex flex-wrap gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          {["Tous", "Villa", "Appartement", "Riad", "Duplex"].map((t) => (
            <option key={t} value={t} className="bg-[color:var(--color-agency-bg)]">
              {t}
            </option>
          ))}
        </select>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ville..."
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[color:var(--color-agency-accent)]"
        />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full agency-card rounded-xl p-8 text-center text-white/50">
            Aucun bien trouvé
          </div>
        ) : (
          filtered.map((p) => <PropertyCard key={p.id} p={p} />)
        )}
      </div>
    </div>
  );
}

function PropertyCard({ p }: { p: Property }) {
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(p.imageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const statusColor =
    p.status === "Disponible"
      ? "bg-emerald-500/20 text-emerald-400"
      : p.status === "Vendu"
        ? "bg-red-500/20 text-red-400"
        : "bg-amber-500/20 text-amber-400";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!getToken()) {
      setError("Connectez-vous pour uploader une image.");
      return;
    }
    setUploading(true);
    try {
      const updated = await uploadPropertyImage(p.id, file);
      setImageUrl(updated.imageUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="agency-card rounded-xl overflow-hidden hover:border-white/20 transition">
      <div
        className="aspect-video flex items-center justify-center relative"
        style={{
          background: "linear-gradient(135deg, oklch(0.22 0.04 260), oklch(0.28 0.06 265))",
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl opacity-30">🏠</div>
        )}
        <span
          className={`absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full ${statusColor}`}
        >
          {p.status}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-black/50 text-white hover:bg-black/70 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Envoi...
            </>
          ) : (
            <>
              <Upload className="w-3 h-3" /> Photo
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      {error && <p className="px-4 pt-2 text-[11px] text-red-400">{error}</p>}
      <div className="p-4">
        <div className="font-medium">{p.name}</div>
        <div className="flex items-center gap-1 text-xs text-white/60 mt-1">
          <MapPin className="w-3 h-3" /> {p.neighborhood}, {p.city}
        </div>
        <div className="text-xl font-semibold text-[color:var(--color-agency-accent-light)] mt-3">
          {formatPrice(p.price)}
        </div>
        <div className="flex items-center gap-4 text-xs text-white/60 mt-2">
          <span>{p.superficie} m²</span>
          <span>{p.rooms} pièces</span>
          <span>Étage {p.floor}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShow3D(true)}
            className="flex-1 py-1.5 text-xs rounded-md border border-white/10 hover:bg-white/5"
          >
            Voir 3D
          </button>
          <button className="flex-1 py-1.5 text-xs rounded-md bg-[color:var(--color-agency-accent)] text-white hover:brightness-110">
            IA Chat
          </button>
        </div>
      </div>

      <Property3DModal
        open={show3D}
        onClose={() => setShow3D(false)}
        propertyName={p.name}
      />
    </div>
  );
}
