"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Loader2, Lock, Mail, User, Wallet } from "lucide-react";
import { ApiError, googleLoginUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Role = "CLIENT" | "AGENCY";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({ email, password, name: name || undefined, role });
      const dest = redirect || (user.role === "AGENCY" ? "/agency" : "/client");
      router.replace(dest);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen agency-surface flex items-center justify-center px-6 py-12">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, oklch(0.55 0.22 258 / 0.3), transparent 60%), radial-gradient(ellipse at 70% 60%, oklch(0.6 0.19 280 / 0.25), transparent 60%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md agency-card rounded-2xl p-8"
      >
        <Link href="/" className="text-xl font-semibold gradient-text">
          ViewBeforeBuy
        </Link>
        <h1 className="text-2xl font-semibold mt-6">Créer un compte</h1>
        <p className="text-sm text-white/60 mt-1">Rejoignez ViewBeforeBuy en quelques secondes.</p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-white/50">Je suis…</span>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              {(
                [
                  { value: "CLIENT" as Role, label: "Client", icon: Wallet, hint: "Acheter & financer" },
                  { value: "AGENCY" as Role, label: "Agence", icon: Building2, hint: "Publier des biens" },
                ]
              ).map((opt) => {
                const active = role === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition ${
                      active
                        ? "border-[color:var(--color-agency-accent)] bg-[color:var(--color-agency-accent)]/15"
                        : "border-white/10 bg-white/5 hover:border-white/25"
                    }`}
                  >
                    <opt.icon
                      className={`w-4 h-4 ${active ? "text-[color:var(--color-agency-accent-light)]" : "text-white/50"}`}
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-[11px] text-white/50">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-white/50">Nom (optionnel)</span>
            <div className="mt-1.5 relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[color:var(--color-agency-accent)] transition"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-white/50">Email</span>
            <div className="mt-1.5 relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.ma"
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[color:var(--color-agency-accent)] transition"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-white/50">Mot de passe</span>
            <div className="mt-1.5 relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 8 caractères"
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[color:var(--color-agency-accent)] transition"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[color:var(--color-agency-accent)] text-white font-medium py-2.5 hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Créer mon compte <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-white/30 text-xs">
          <span className="h-px flex-1 bg-white/10" />
          OU
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <a
          href={googleLoginUrl()}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/15 text-white/90 py-2.5 text-sm hover:bg-white/5 transition"
        >
          <GoogleIcon /> Continuer avec Google
        </a>

        <p className="mt-6 text-center text-sm text-white/60">
          Déjà un compte ?{" "}
          <Link
            href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-[color:var(--color-agency-accent-light)] hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.3 12 2.3 6.9 2.3 2.8 6.4 2.8 11.5S6.9 20.7 12 20.7c5.2 0 8.7-3.7 8.7-8.9 0-.6-.06-1-.15-1.6H12z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen agency-surface flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-white/70" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
