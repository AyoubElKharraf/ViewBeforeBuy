"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { calculateEligibility, formatDH } from "@/utils/creditCalculator";
import { useAI } from "@/hooks/useAI";
import { Sparkles } from "lucide-react";

export default function ScorePage() {
  const [income, setIncome] = useState(15000);
  const [debts, setDebts] = useState(1500);
  const [down, setDown] = useState(300000);
  const [duration, setDuration] = useState(25);
  const [result, setResult] = useState<ReturnType<typeof calculateEligibility> | null>(null);
  const [advice, setAdvice] = useState("");
  const { send, loading } = useAI("client");

  const compute = () => {
    const r = calculateEligibility({
      monthlyIncome: income,
      existingDebts: debts,
      downPayment: down,
      duration,
    });
    setResult(r);
    setAdvice("");
  };

  const askAI = async () => {
    if (!result) return;
    const ctx = `Revenu ${income} DH/mois, Crédits ${debts} DH/mois, Apport ${down} DH, Durée ${duration} ans. Score: ${result.score}/100, Statut: ${result.status}, Capacité max: ${Math.round(result.maxLoan)} DH.`;
    const reply = await send(
      "Donne 3 recommandations actionnables courtes pour améliorer mon éligibilité.",
      ctx,
    );
    setAdvice(reply);
  };

  const color =
    result?.status === "eligible"
      ? "text-emerald-600"
      : result?.status === "borderline"
        ? "text-amber-600"
        : "text-red-600";
  const label =
    result?.status === "eligible"
      ? "Très Éligible"
      : result?.status === "borderline"
        ? "Éligible sous conditions"
        : "Insuffisant";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Mon Score d'Éligibilité
        </h1>
        <p className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
          Selon les règles BAM (taux max 33%)
        </p>
      </div>

      <div className="client-card rounded-2xl p-5 space-y-4">
        <NumberField label="Salaire mensuel net (DH)" value={income} setValue={setIncome} />
        <NumberField label="Crédits en cours (DH/mois)" value={debts} setValue={setDebts} />
        <NumberField label="Apport disponible (DH)" value={down} setValue={setDown} />
        <div>
          <div className="text-sm mb-2">Durée souhaitée</div>
          <div className="flex gap-2">
            {[10, 15, 20, 25].map((y) => (
              <button
                key={y}
                onClick={() => setDuration(y)}
                className={`flex-1 py-2 rounded-lg text-sm border transition ${
                  duration === y
                    ? "bg-[color:var(--color-client-gold)] text-white border-transparent"
                    : "border-[color:var(--color-client-border)]"
                }`}
              >
                {y} ans
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={compute}
          className="w-full py-3 rounded-lg bg-[color:var(--color-client-gold)] text-white font-medium"
        >
          Calculer mon score
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" }}
          className="client-card rounded-2xl p-6 text-center"
        >
          <ScoreGauge score={result.score} />
          <div className={`text-lg font-semibold mt-4 ${color}`}>{label}</div>
          <div className="grid grid-cols-2 gap-4 mt-6 text-left">
            <Stat label="Capacité d'emprunt" value={formatDH(result.maxLoan)} />
            <Stat label="Mensualité max" value={formatDH(result.maxMonthly)} />
            <Stat label="Taux d'endettement" value={`${Math.round(result.debtRatio)}%`} />
            <Stat label="Score final" value={`${result.score}/100`} />
          </div>

          <button
            onClick={askAI}
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-client-gold)]/15 text-[color:var(--color-client-gold)] text-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Analyse..." : "Conseils IA"}
          </button>
          {advice && (
            <div className="mt-4 text-sm text-left text-[color:var(--color-client-text-muted)] whitespace-pre-line">
              {advice}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <div>
      <div className="text-sm mb-1.5">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value) || 0)}
        className="w-full bg-white/60 border border-[color:var(--color-client-border)] rounded-lg px-3 py-2 text-sm text-[color:var(--color-client-text)] focus:outline-none focus:border-[color:var(--color-client-gold)]"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[color:var(--color-client-text-muted)]">{label}</div>
      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const c = 2 * Math.PI * 54;
  const offset = c - (clamped / 100) * c;
  const stroke =
    score >= 70
      ? "oklch(0.68 0.16 155)"
      : score >= 40
        ? "oklch(0.78 0.16 75)"
        : "oklch(0.62 0.24 27)";

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="oklch(0.85 0.03 65)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          {clamped}
        </div>
        <div className="text-xs text-[color:var(--color-client-text-muted)]">/ 100</div>
      </div>
    </div>
  );
}
