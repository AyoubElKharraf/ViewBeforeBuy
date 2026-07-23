"use client";

import { useState } from "react";
import { Bell, Building2, Check, Mail, Save, Shield, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AgencySettingsPage() {
  const { user } = useAuth();
  const [agencyName, setAgencyName] = useState("Agence ViewBeforeBuy");
  const [phone, setPhone] = useState("+212 6 00 00 00 00");
  const [city, setCity] = useState("Oujda");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyLeads, setNotifyLeads] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Paramètres</h1>
        <p className="text-sm text-white/50 mt-1">
          Profil agence et préférences (sauvegarde locale pour la démo)
        </p>
      </div>

      <section className="agency-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <User className="w-4 h-4 text-[color:var(--color-agency-accent-light)]" />
          Compte connecté
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Info label="Nom" value={user?.name || "—"} />
          <Info label="Email" value={user?.email || "—"} />
          <Info label="Rôle" value={user?.role || "—"} />
          <Info label="Provider" value={user?.provider || "local"} />
        </div>
      </section>

      <form onSubmit={handleSave} className="space-y-4">
        <section className="agency-card rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="w-4 h-4 text-[color:var(--color-agency-accent-light)]" />
            Profil agence
          </div>
          <Field label="Nom de l'agence" value={agencyName} onChange={setAgencyName} />
          <Field label="Téléphone" value={phone} onChange={setPhone} />
          <Field label="Ville" value={city} onChange={setCity} />
        </section>

        <section className="agency-card rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bell className="w-4 h-4 text-[color:var(--color-agency-accent-light)]" />
            Notifications
          </div>
          <Toggle
            icon={Mail}
            label="Alertes email"
            description="Recevoir un résumé quotidien"
            checked={notifyEmail}
            onChange={setNotifyEmail}
          />
          <Toggle
            icon={Shield}
            label="Nouveaux leads"
            description="Notification à chaque conversation IA"
            checked={notifyLeads}
            onChange={setNotifyLeads}
          />
        </section>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[color:var(--color-agency-accent)] text-white text-sm font-medium hover:brightness-110 transition"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" /> Enregistré
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Enregistrer
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
      <div className="text-[11px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="mt-0.5 truncate">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-white/50">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[color:var(--color-agency-accent)]"
      />
    </label>
  );
}

function Toggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Mail;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-left hover:bg-white/[0.07] transition"
    >
      <div className="w-9 h-9 rounded-lg bg-[color:var(--color-agency-accent)]/20 text-[color:var(--color-agency-accent-light)] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-white/45">{description}</div>
      </div>
      <span
        className={`relative w-10 h-6 rounded-full transition ${
          checked ? "bg-[color:var(--color-agency-accent)]" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}
