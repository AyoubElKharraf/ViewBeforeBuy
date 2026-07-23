"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Sparkles, X } from "lucide-react";
import { formatDH } from "@/utils/creditCalculator";
import type { AiScoreResponse } from "@/lib/api";

export function AiScoreModal({
  open,
  onClose,
  loading,
  error,
  data,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  data: AiScoreResponse | null;
}) {
  const statusLabel = data
    ? data.eligibility.status === "eligible"
      ? "Très éligible"
      : data.eligibility.status === "borderline"
        ? "Éligible sous conditions"
        : "Insuffisant"
    : "";
  const statusColor = data
    ? data.eligibility.status === "eligible"
      ? "text-emerald-600"
      : data.eligibility.status === "borderline"
        ? "text-amber-600"
        : "text-red-600"
    : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[color:var(--color-client-card)] border border-[color:var(--color-client-border)] p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[color:var(--color-client-gold)]/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[color:var(--color-client-gold)]" />
                </div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                  Optimisation IA
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[color:var(--color-client-text-muted)] hover:bg-black/5"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading && (
              <div className="py-10 flex flex-col items-center gap-3 text-[color:var(--color-client-text-muted)]">
                <Loader2 className="w-6 h-6 animate-spin text-[color:var(--color-client-gold)]" />
                <span className="text-sm">Analyse de votre profil en cours…</span>
              </div>
            )}

            {error && !loading && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {data && !loading && !error && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-[color:var(--color-client-gold)]/10 px-4 py-3">
                  <div>
                    <div className="text-xs text-[color:var(--color-client-text-muted)]">
                      Score d'éligibilité
                    </div>
                    <div className={`text-2xl font-semibold ${statusColor}`}>
                      {data.eligibility.score}
                      <span className="text-sm text-[color:var(--color-client-text-muted)]">/100</span>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${statusColor}`}>{statusLabel}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Capacité d'emprunt" value={formatDH(data.eligibility.maxLoan)} />
                  <Stat label="Mensualité max" value={formatDH(data.eligibility.maxMonthly)} />
                  <Stat
                    label="Taux d'endettement"
                    value={`${Math.round(data.eligibility.debtRatio)}%`}
                  />
                  <Stat label="Statut" value={statusLabel} />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-[color:var(--color-client-gold)] mb-1.5">
                    Recommandations
                  </div>
                  <p className="text-sm text-[color:var(--color-client-text)] whitespace-pre-line leading-relaxed">
                    {data.recommendations}
                  </p>
                </div>

                {data.source === "fallback" && (
                  <p className="text-[11px] text-[color:var(--color-client-text-muted)] italic">
                    Recommandations déterministes (assistant IA non configuré).
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-client-border)] px-3 py-2">
      <div className="text-xs text-[color:var(--color-client-text-muted)]">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
