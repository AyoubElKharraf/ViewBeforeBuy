"use client";

import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { useComparator } from "@/hooks/useComparator";

export function CompareBar() {
  const { ids, count, remove, clear } = useComparator();
  if (count === 0) return null;

  return (
    <div className="fixed bottom-20 inset-x-0 z-40 px-4 pointer-events-none md:bottom-6">
      <div className="max-w-5xl mx-auto pointer-events-auto client-card rounded-2xl shadow-lg border border-[color:var(--color-client-gold)]/30 px-4 py-3 flex items-center gap-3 bg-[color:var(--color-client-card)]">
        <GitCompare className="w-4 h-4 text-[color:var(--color-client-gold)] shrink-0" />
        <div className="text-sm flex-1">
          <span className="font-medium">{count}/3</span> biens sélectionnés
          <div className="flex gap-1 mt-1">
            {ids.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => remove(id)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--color-client-gold)]/15 inline-flex items-center gap-1"
              >
                #{id} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={clear} className="text-xs opacity-60 hover:opacity-100">
          Vider
        </button>
        <Link
          href="/client/compare"
          className="px-3 py-2 rounded-lg bg-[color:var(--color-client-gold)] text-white text-xs font-medium"
        >
          Comparer
        </Link>
      </div>
    </div>
  );
}
