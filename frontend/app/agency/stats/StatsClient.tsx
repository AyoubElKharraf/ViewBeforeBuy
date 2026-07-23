"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
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
import { Building, Eye, MessageSquare, TrendingUp } from "lucide-react";
import type { Conversation, Property } from "@/lib/api";
import { formatPrice } from "@/utils/types";

const ACTIVITY = [
  { month: "Jan", visites: 42, conversations: 8 },
  { month: "Fév", visites: 58, conversations: 11 },
  { month: "Mar", visites: 71, conversations: 14 },
  { month: "Avr", visites: 89, conversations: 18 },
  { month: "Mai", visites: 112, conversations: 24 },
  { month: "Juin", visites: 148, conversations: 31 },
];

const PIE_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#4f46e5", "#4338ca"];

export default function StatsClient({
  properties,
  conversations,
}: {
  properties: Property[];
  conversations: Conversation[];
}) {
  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of properties) {
      map.set(p.type, (map.get(p.type) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [properties]);

  const byCity = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of properties) {
      map.set(p.city, (map.get(p.city) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, biens]) => ({ name, biens }))
      .sort((a, b) => b.biens - a.biens);
  }, [properties]);

  const avgPrice =
    properties.length > 0
      ? properties.reduce((s, p) => s + p.price, 0) / properties.length
      : 0;

  const unread = conversations.filter((c) => c.unread).length;

  const kpis = [
    {
      label: "Biens actifs",
      value: properties.length,
      icon: Building,
      hint: "Catalogue publié",
    },
    {
      label: "Conversations",
      value: conversations.length,
      icon: MessageSquare,
      hint: `${unread} non lue${unread !== 1 ? "s" : ""}`,
    },
    {
      label: "Prix moyen",
      value: properties.length ? formatPrice(avgPrice) : "—",
      icon: TrendingUp,
      hint: "Sur le portefeuille",
    },
    {
      label: "Visites (mois)",
      value: ACTIVITY[ACTIVITY.length - 1]?.visites ?? 0,
      icon: Eye,
      hint: "Estimation activité",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Statistiques</h1>
        <p className="text-sm text-white/50 mt-1">
          Performance de votre agence et répartition du portefeuille
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="agency-card rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="text-xs text-white/50">{k.label}</div>
              <div className="w-8 h-8 rounded-lg bg-[color:var(--color-agency-accent)]/20 text-[color:var(--color-agency-accent-light)] flex items-center justify-center">
                <k.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold mt-3">{k.value}</div>
            <div className="text-xs text-white/40 mt-1">{k.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="agency-card rounded-xl p-5">
          <h2 className="text-sm font-medium mb-4">Activité (6 mois)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ACTIVITY}>
                <defs>
                  <linearGradient id="visitesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.03 260)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visites"
                  stroke="#6366f1"
                  fill="url(#visitesFill)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="conversations"
                  stroke="#a5b4fc"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="agency-card rounded-xl p-5">
          <h2 className="text-sm font-medium mb-4">Répartition par type</h2>
          {byType.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-white/40">
              Aucun bien à afficher
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {byType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0.03 260)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3 text-xs text-white/50">
            {byType.map((t, i) => (
              <span key={t.name} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {t.name} ({t.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="agency-card rounded-xl p-5">
        <h2 className="text-sm font-medium mb-4">Biens par ville</h2>
        {byCity.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-white/40">
            Aucune donnée géographique
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCity} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis allowDecimals={false} fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.03 260)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="biens" radius={[6, 6, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
