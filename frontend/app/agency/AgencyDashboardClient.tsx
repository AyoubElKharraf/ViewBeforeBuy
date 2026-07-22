"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Building,
  Eye,
  Users,
  Calculator,
  Upload,
  Search,
  Send,
  Sparkles,
  Mic,
  X,
  Circle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type Conversation, type Property } from "@/lib/api";
import { useAI } from "@/hooks/useAI";

const ACTIVITY = [
  { month: "Jan", visites: 42, prospects: 12 },
  { month: "Fév", visites: 58, prospects: 18 },
  { month: "Mar", visites: 71, prospects: 22 },
  { month: "Avr", visites: 89, prospects: 27 },
  { month: "Mai", visites: 112, prospects: 31 },
  { month: "Juin", visites: 148, prospects: 37 },
];

const PIE_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#4f46e5", "#4338ca"];

const STATS = [
  { label: "Biens publiés", value: 24, trend: "+3 ce mois", icon: Building },
  { label: "Visites virtuelles", value: 148, trend: "+22 cette semaine", icon: Eye },
  { label: "Clients intéressés", value: 37, trend: "+5 aujourd'hui", icon: Users },
  { label: "Crédits simulés", value: 89, trend: "+12 cette semaine", icon: Calculator },
];

export default function AgencyDashboardClient({
  initialConversations,
  properties = [],
}: {
  initialConversations: Conversation[];
  properties?: Property[];
}) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-white/50 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="agency-card rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <div className="text-xs text-white/50">{s.label}</div>
              <div className="w-8 h-8 rounded-lg bg-[color:var(--color-agency-accent)]/20 text-[color:var(--color-agency-accent-light)] flex items-center justify-center">
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-semibold mt-3">{s.value}</div>
            <div className="text-xs text-emerald-400 mt-1">{s.trend}</div>
          </motion.div>
        ))}
      </div>

      <ChartsRow properties={properties} />

      <div className="grid lg:grid-cols-5 gap-4">
        <ConversationsPanel conversations={initialConversations} />
        <div className="lg:col-span-2 space-y-4">
          <UploadZone />
          <Viewer3D />
        </div>
      </div>

      <button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[color:var(--color-agency-accent)] text-white shadow-lg shadow-blue-500/40 flex items-center justify-center hover:brightness-110 transition z-40"
      >
        <span className="absolute inset-0 rounded-full bg-[color:var(--color-agency-accent)]/30 animate-ping" />
        <Mic className="w-5 h-5 relative" />
      </button>

      {aiOpen && <AIDrawer onClose={() => setAiOpen(false)} />}
    </div>
  );
}

function ChartsRow({ properties }: { properties: Property[] }) {
  const typeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of properties) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    return Array.from(counts, ([name, value]) => ({ name, value }));
  }, [properties]);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 agency-card rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4">Activité (6 derniers mois)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gVisites" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProspects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a24",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="visites"
                stroke="#6366f1"
                fill="url(#gVisites)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="prospects"
                stroke="#34d399"
                fill="url(#gProspects)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="agency-card rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4">Biens par type</h3>
        <div className="h-64">
          {typeData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-white/40">
              Aucune donnée
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {typeData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1a1a24",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {typeData.map((entry, i) => (
            <span key={entry.name} className="inline-flex items-center gap-1.5 text-xs text-white/60">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              {entry.name} ({entry.value})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversationsPanel({ conversations }: { conversations: Conversation[] }) {
  const [q, setQ] = useState("");
  const filtered = conversations.filter((c) =>
    c.propertyName.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="lg:col-span-3 agency-card rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Conversations IA</h2>
        <button className="text-xs px-3 py-1.5 rounded-md bg-[color:var(--color-agency-accent)] text-white">
          Nouvelle conversation
        </button>
      </div>
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[color:var(--color-agency-accent)]"
        />
      </div>
      <div className="space-y-2 max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-sm text-white/50 text-center py-8">Aucune conversation</div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-[color:var(--color-agency-accent)]/15 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-[color:var(--color-agency-accent-light)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm truncate">{c.propertyName}</div>
                  {c.unread && (
                    <span className="w-2 h-2 rounded-full bg-[color:var(--color-agency-accent)]" />
                  )}
                </div>
                <div className="text-xs text-white/50 truncate mt-0.5">{c.lastMessage}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-white/40">{c.timestamp}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[color:var(--color-agency-accent)]/20 text-[color:var(--color-agency-accent-light)]">
                    {c.propertyType}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function UploadZone() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      className={`agency-card rounded-xl p-5 border-2 border-dashed transition ${
        dragActive
          ? "border-[color:var(--color-agency-accent)] bg-[color:var(--color-agency-accent)]/5"
          : "border-white/15"
      }`}
    >
      <div className="text-center py-6">
        <div className="w-12 h-12 mx-auto rounded-full bg-[color:var(--color-agency-accent)]/20 text-[color:var(--color-agency-accent-light)] flex items-center justify-center mb-3">
          <Upload className="w-5 h-5" />
        </div>
        <div className="text-sm font-medium">Déposez votre plan ou photo</div>
        <div className="text-xs text-white/50 mt-1">JPG · PNG · PDF · DWG</div>
      </div>
    </div>
  );
}

function Viewer3D() {
  const tabs = ["Villa", "Appartement", "Riad", "Duplex"];
  const [active, setActive] = useState("Villa");

  return (
    <div className="agency-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Aperçu 3D du bien</h3>
      </div>
      <div className="flex gap-1 mb-3">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`text-xs px-2.5 py-1 rounded-md transition ${
              active === t
                ? "bg-[color:var(--color-agency-accent)] text-white"
                : "text-white/60 hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        className="relative aspect-video rounded-lg overflow-hidden border border-[color:var(--color-agency-accent)]/30"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.25 0.05 260), oklch(0.14 0.03 260))",
        }}
      >
        <BuildingWireframe />
      </div>
      <button className="w-full mt-3 py-2.5 rounded-lg bg-gradient-to-r from-[color:var(--color-agency-accent)] to-[color:var(--color-agency-accent-light)] text-white text-sm font-medium hover:brightness-110 transition inline-flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" /> Générer vue 3D avec l'IA
      </button>
    </div>
  );
}

function BuildingWireframe() {
  return (
    <svg viewBox="0 0 200 140" className="absolute inset-0 w-full h-full">
      <motion.g
        style={{ transformOrigin: "100px 80px" }}
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <g stroke="oklch(0.68 0.19 258)" strokeWidth="0.8" fill="none" opacity="0.9">
          <polygon points="60,110 140,110 160,95 80,95" />
          <polygon points="140,110 140,55 160,45 160,95" />
          <polygon points="60,55 140,55 160,45 80,45" />
          <polygon points="60,55 60,110 80,95 80,45" />
          <polygon points="80,45 160,45 140,30 100,30" fill="oklch(0.55 0.22 258 / 0.15)" />
          <rect x="72" y="65" width="12" height="14" />
          <rect x="94" y="65" width="12" height="14" />
          <rect x="116" y="65" width="12" height="14" />
          <rect x="72" y="85" width="12" height="14" />
          <rect x="116" y="85" width="12" height="14" />
          <rect x="94" y="85" width="12" height="20" fill="oklch(0.55 0.22 258 / 0.3)" />
        </g>
      </motion.g>
    </svg>
  );
}

function AIDrawer({ onClose }: { onClose: () => void }) {
  const { send, loading } = useAI("agency");
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Bonjour ! Comment puis-je vous aider avec vos biens aujourd'hui ?",
    },
  ]);

  const submit = async () => {
    if (!msg.trim() || loading) return;
    const userMsg = msg;
    setMsg("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    try {
      const reply = await send(userMsg);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Une erreur est survenue. Veuillez réessayer." },
      ]);
    }
  };

  const chips = ["Décrire ce bien", "Estimer le prix", "Rédiger annonce"];

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25 }}
      className="fixed bottom-0 right-6 w-[380px] h-[560px] agency-card rounded-t-2xl shadow-2xl flex flex-col z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <div className="text-sm font-medium">Assistant IA</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <Circle className="w-1.5 h-1.5 fill-current" /> En ligne
          </div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-[color:var(--color-agency-accent)] text-white"
                  : "bg-white/10 text-white/90"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 px-3 py-2 rounded-2xl text-sm text-white/60">
              <span className="inline-flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setMsg(c)}
              className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/70 hover:bg-white/10"
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Posez votre question..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[color:var(--color-agency-accent)]"
          />
          <button
            onClick={submit}
            disabled={loading}
            className="px-3 rounded-lg bg-[color:var(--color-agency-accent)] text-white hover:brightness-110 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
