"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Cpu,
  Landmark,
  Clock,
  EyeOff,
  Sparkles,
  Wallet,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen agency-surface overflow-x-hidden">
      <nav className="fixed top-0 inset-x-0 z-40 backdrop-blur-lg border-b border-white/5 bg-[color:var(--color-agency-bg)]/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-semibold gradient-text tracking-tight">ViewBeforeBuy</div>
          <div className="flex items-center gap-3">
            <Link
              href="/client"
              className="px-4 py-2 text-sm text-white/80 hover:text-white transition"
            >
              Espace Client
            </Link>
            <Link
              href="/agency"
              className="px-4 py-2 text-sm rounded-md bg-[color:var(--color-agency-accent)] text-white hover:brightness-110 transition"
            >
              Espace Agence
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-24 px-6">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, oklch(0.55 0.22 258 / 0.3), transparent 60%), radial-gradient(ellipse at 70% 60%, oklch(0.6 0.19 280 / 0.25), transparent 60%)",
          }}
        />
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-6xl md:text-8xl font-semibold tracking-tight"
          >
            <span className="gradient-text">ViewBeforeBuy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-sans"
          >
            La première plateforme marocaine qui combine{" "}
            <span className="text-white">3D, IA et Fintech</span> pour révolutionner l'immobilier.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/agency"
              className="group px-6 py-3 rounded-lg bg-[color:var(--color-agency-accent)] text-white font-medium hover:brightness-110 transition inline-flex items-center gap-2"
            >
              Espace Agence <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/client"
              className="px-6 py-3 rounded-lg border border-white/20 text-white/90 hover:bg-white/5 transition"
            >
              Espace Client
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { n: "6-18 mois", l: "réduits à quelques jours" },
              { n: "3 banques", l: "comparées en temps réel" },
              { n: "5 min", l: "pour simuler un crédit" },
              { n: "3000+", l: "agences ciblées" },
            ].map((s) => (
              <div key={s.n} className="agency-card rounded-xl p-5">
                <div className="text-2xl font-semibold gradient-text">{s.n}</div>
                <div className="text-xs text-white/60 mt-1">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-14">
            L'immobilier marocain, coincé au XX<sup>e</sup> siècle
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                t: "Processus trop long",
                d: "6 à 18 mois entre la recherche et la signature.",
              },
              {
                icon: EyeOff,
                t: "Financement opaque",
                d: "Difficile de comparer les offres bancaires.",
              },
              {
                icon: Building2,
                t: "Zéro digital",
                d: "Ni 3D, ni IA, ni analyse financière automatisée.",
              },
            ].map((p) => (
              <div key={p.t} className="agency-card rounded-2xl p-6">
                <div className="w-11 h-11 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center mb-4">
                  <p.icon className="w-5 h-5" />
                </div>
                <div className="text-lg font-medium">{p.t}</div>
                <p className="text-sm text-white/60 mt-2">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-4">
            Trois piliers, une <span className="gradient-text">révolution</span>
          </h2>
          <p className="text-center text-white/60 mb-14 max-w-2xl mx-auto">
            Une seule plateforme pour visualiser, comprendre et financer.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                t: "Digital 3D",
                d: "Visitez les biens en 3D immersive, avant même de vous déplacer.",
              },
              {
                icon: Cpu,
                t: "IA experte",
                d: "Un assistant IA qui décrit, estime et négocie pour vous.",
              },
              {
                icon: Landmark,
                t: "Fintech intégrée",
                d: "Simulation de crédit, comparaison bancaire, score d'éligibilité.",
              },
            ].map((p) => (
              <div
                key={p.t}
                className="agency-card rounded-2xl p-7 hover:border-white/20 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-[color:var(--color-agency-accent)]/20 text-[color:var(--color-agency-accent-light)] flex items-center justify-center mb-5">
                  <p.icon className="w-6 h-6" />
                </div>
                <div className="text-xl font-medium">{p.t}</div>
                <p className="text-sm text-white/65 mt-2 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="agency-card rounded-2xl p-8">
            <div className="text-xs uppercase tracking-widest text-[color:var(--color-agency-accent-light)] mb-3">
              Pour les agences
            </div>
            <h3 className="text-3xl font-semibold mb-6">Publiez, converse, convertissez.</h3>
            <ul className="space-y-3 text-white/70 text-sm">
              {[
                "Upload de plans, photos & DWG",
                "Génération 3D automatique par IA",
                "Assistant vocal pour chaque bien",
                "Statistiques de visite en temps réel",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[color:var(--color-agency-accent-light)]" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/agency"
              className="mt-8 inline-flex items-center gap-2 text-[color:var(--color-agency-accent-light)] hover:underline"
            >
              Découvrir l'espace agence <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="agency-card rounded-2xl p-8">
            <div className="text-xs uppercase tracking-widest text-[color:var(--color-agency-accent-light)] mb-3">
              Pour les clients
            </div>
            <h3 className="text-3xl font-semibold mb-6">Visualisez. Analysez. Financez.</h3>
            <ul className="space-y-3 text-white/70 text-sm">
              {[
                "Visite 3D immersive de chaque bien",
                "Simulateur de crédit temps réel",
                "Comparateur des banques marocaines",
                "Rapport IA personnalisé par bien",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-[color:var(--color-agency-accent-light)]" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/client"
              className="mt-8 inline-flex items-center gap-2 text-[color:var(--color-agency-accent-light)] hover:underline"
            >
              Découvrir l'espace client <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-white/5 text-center text-sm text-white/50">
        <div>
          Made with <span className="text-red-400">♥</span> in Oujda, Morocco 🇲🇦
        </div>
        <div className="mt-2 text-xs">
          DiNext'26 · 2<sup>nd</sup> Place 🏆 · UMP Oujda
        </div>
      </footer>
    </div>
  );
}
