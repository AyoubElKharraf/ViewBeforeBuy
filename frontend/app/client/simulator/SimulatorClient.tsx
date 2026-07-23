"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateCredit, formatDH } from "@/utils/creditCalculator";
import { aiScoreEligibility, ApiError, type AiScoreResponse, type Bank } from "@/lib/api";
import { AiScoreModal } from "@/components/AiScoreModal";

export default function SimulatorClient({ banks }: { banks: Bank[] }) {
  const [price, setPrice] = useState(1200000);
  const [down, setDown] = useState(240000);
  const [duration, setDuration] = useState(25);
  const [income, setIncome] = useState(15000);
  const [modalOpen, setModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiData, setAiData] = useState<AiScoreResponse | null>(null);

  const best = banks[0] ?? {
    name: "CIH Bank",
    rate: 4.3,
    maxDuration: 25,
    minDownPayment: 10,
    logo: "🏦",
    recommended: true,
    features: [],
  };

  const main = useMemo(
    () =>
      calculateCredit({ propertyPrice: price, downPayment: down, duration, annualRate: best.rate }),
    [price, down, duration, best.rate],
  );

  const bankResults = banks.map((b) => ({
    bank: b,
    result: calculateCredit({
      propertyPrice: price,
      downPayment: down,
      duration,
      annualRate: b.rate,
    }),
  }));

  const bankChartData = bankResults.map(({ bank, result }) => ({
    name: bank.name,
    mensualite: Math.round(result.monthlyPayment),
  }));

  const breakdownData = [
    { name: "Capital", value: Math.round(main.loanAmount) },
    { name: "Intérêts", value: Math.round(main.totalInterest) },
  ];

  const GOLD = "#c9a227";
  const GOLD_LIGHT = "#e6c65c";

  const optimizeWithAi = async () => {
    setModalOpen(true);
    setAiLoading(true);
    setAiError(null);
    setAiData(null);
    try {
      const data = await aiScoreEligibility({
        monthlyIncome: income,
        existingDebts: 0,
        downPayment: down,
        duration,
        loanAmount: main.loanAmount,
        propertyPrice: price,
        query:
          "Analyse cette simulation de crédit et explique comment optimiser mon score d'éligibilité.",
      });
      setAiData(data);
    } catch (err) {
      setAiError(
        err instanceof ApiError
          ? err.message
          : "Impossible d'obtenir les recommandations IA.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Simulateur de Crédit
        </h1>
        <p className="text-sm text-[color:var(--color-client-text-muted)] mt-1">
          Calculez vos mensualités en temps réel
        </p>
      </div>

      <div className="client-card rounded-2xl p-5 space-y-5">
        <Field
          label="Prix du bien"
          value={price}
          setValue={setPrice}
          min={200000}
          max={10000000}
          step={50000}
        />
        <Field
          label="Apport personnel"
          value={down}
          setValue={setDown}
          min={0}
          max={price}
          step={10000}
          suffix={`${Math.round((down / price) * 100)}%`}
        />
        <div>
          <div className="text-sm mb-2">Durée</div>
          <div className="flex gap-2">
            {[10, 15, 20, 25].map((y) => (
              <button
                key={y}
                onClick={() => setDuration(y)}
                className={`flex-1 py-2 rounded-lg text-sm border transition ${
                  duration === y
                    ? "bg-[color:var(--color-client-gold)] text-white border-transparent"
                    : "border-[color:var(--color-client-border)] text-[color:var(--color-client-text)]"
                }`}
              >
                {y} ans
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        key={`${price}-${down}-${duration}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-gradient-to-br from-[color:var(--color-client-gold)]/20 to-transparent border border-[color:var(--color-client-gold)]/30"
      >
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-client-gold)]">
          Mensualité estimée
        </div>
        <div className="text-4xl font-semibold mt-1" style={{ fontFamily: "var(--font-serif)" }}>
          {formatDH(main.monthlyPayment)}
          <span className="text-lg">/mois</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <div className="text-[color:var(--color-client-text-muted)] text-xs">
              Montant emprunté
            </div>
            <div className="font-medium">{formatDH(main.loanAmount)}</div>
          </div>
          <div>
            <div className="text-[color:var(--color-client-text-muted)] text-xs">Coût total</div>
            <div className="font-medium">{formatDH(main.totalCost)}</div>
          </div>
          <div>
            <div className="text-[color:var(--color-client-text-muted)] text-xs">Intérêts</div>
            <div className="font-medium">{formatDH(main.totalInterest)}</div>
          </div>
          <div>
            <div className="text-[color:var(--color-client-text-muted)] text-xs">Taux</div>
            <div className="font-medium">{best.rate}%</div>
          </div>
        </div>
      </motion.div>

      <div className="client-card rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
          Répartition du crédit
        </h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdownData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={3}
              >
                <Cell fill={GOLD} />
                <Cell fill={GOLD_LIGHT} />
              </Pie>
              <Tooltip
                formatter={(value) => formatDH(Number(value))}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-xs text-[color:var(--color-client-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: GOLD }} /> Capital{" "}
            {formatDH(main.loanAmount)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: GOLD_LIGHT }} /> Intérêts{" "}
            {formatDH(main.totalInterest)}
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          Comparateur bancaire
        </h2>
        {bankChartData.length > 0 && (
          <div className="client-card rounded-2xl p-5 mb-3">
            <div className="text-sm mb-3">Mensualité par banque</div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bankChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip
                    formatter={(value) => formatDH(Number(value))}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="mensualite" radius={[6, 6, 0, 0]}>
                    {bankChartData.map((entry, i) => (
                      <Cell key={entry.name} fill={i === 0 ? GOLD : GOLD_LIGHT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {bankResults.length === 0 ? (
            <div className="client-card rounded-xl p-4 text-sm text-[color:var(--color-client-text-muted)]">
              Aucune banque disponible. Utilisation des valeurs par défaut.
            </div>
          ) : (
            bankResults.map(({ bank, result }, i) => (
              <motion.div
                key={bank.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`client-card rounded-xl p-4 flex items-center justify-between ${
                  bank.recommended ? "border-2 border-[color:var(--color-client-gold)]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{bank.logo}</div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {bank.name}
                      {bank.recommended && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--color-client-gold)] text-white">
                          Recommandée
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[color:var(--color-client-text-muted)]">
                      Taux {bank.rate}% · {bank.maxDuration} ans max
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatDH(result.monthlyPayment)}</div>
                  <button className="text-xs text-[color:var(--color-client-gold)] mt-1">
                    Contacter
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="client-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[color:var(--color-client-gold)]" />
          <span className="font-medium">Optimisation IA</span>
        </div>
        <p className="text-sm text-[color:var(--color-client-text-muted)]">
          Envoyez votre simulation au copilote pour obtenir un score d'éligibilité et des
          recommandations personnalisées.
        </p>
        <div>
          <div className="text-sm mb-1.5">Revenu mensuel net (DH)</div>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value) || 0)}
            className="w-full bg-white/60 border border-[color:var(--color-client-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--color-client-gold)]"
          />
        </div>
        <button
          onClick={optimizeWithAi}
          disabled={aiLoading || income <= 0}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[color:var(--color-client-gold)] text-white text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          Optimiser mon score avec l'IA
        </button>
      </div>

      <AiScoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={aiLoading}
        error={aiError}
        data={aiData}
      />
    </div>
  );
}

function Field({
  label,
  value,
  setValue,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">
          {formatDH(value)}{" "}
          {suffix && (
            <span className="text-xs text-[color:var(--color-client-text-muted)]">({suffix})</span>
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-[color:var(--color-client-gold)]"
      />
    </div>
  );
}
