"use client";

import dynamic from "next/dynamic";
import { X, Move3d } from "lucide-react";

const Property3DViewer = dynamic(() => import("./Property3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
      Chargement de la visite 3D...
    </div>
  ),
});

export default function Property3DModal({
  open,
  onClose,
  propertyName,
  accent = "#6366f1",
}: {
  open: boolean;
  onClose: () => void;
  propertyName: string;
  accent?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[70vh] rounded-2xl overflow-hidden border border-white/15 bg-[#0e0e14]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2 text-white text-sm">
            <Move3d className="w-4 h-4" />
            <span className="font-medium">Visite 3D — {propertyName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Property3DViewer accent={accent} />

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-white/50">
          Glissez pour pivoter · molette pour zoomer
        </div>
      </div>
    </div>
  );
}
