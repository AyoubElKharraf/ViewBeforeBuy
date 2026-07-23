"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building,
  MessageSquare,
  Box,
  BarChart3,
  Settings,
  Upload,
  LogOut,
  Circle,
} from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";

function initials(name: string | null, email: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const NAV: NavItem[] = [
  { href: "/agency", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/agency/properties", label: "Mes Biens", icon: Building },
  { href: "/agency/conversations", label: "Conversations IA", icon: MessageSquare },
  { href: "/agency/library", label: "Bibliothèque 3D", icon: Box },
  { href: "/agency/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/agency/settings", label: "Paramètres", icon: Settings },
];

function AgencyLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen agency-surface flex">
      <aside className="w-60 shrink-0 bg-[color:oklch(0.13_0.03_260)] border-r border-white/5 flex flex-col fixed inset-y-0 left-0">
        <div className="p-5 border-b border-white/5">
          <div className="text-xl font-semibold gradient-text">ViewBeforeBuy</div>
          <div className="text-xs text-white/50 mt-0.5">Espace Agence</div>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[color:var(--color-agency-accent)]/30 text-[color:var(--color-agency-accent-light)] flex items-center justify-center font-semibold">
              {user ? initials(user.name, user.email) : "?"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || "Utilisateur"}</div>
              <div className="text-xs text-white/50 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[color:var(--color-agency-accent-light)] border border-[color:var(--color-agency-accent)]/40 rounded-full px-2 py-0.5">
            Agence Premium
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-[color:var(--color-agency-accent)]/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[color:var(--color-agency-accent)]" />
                )}
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <Link
            href="/agency/properties"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[color:var(--color-agency-accent)] text-white text-sm font-medium hover:brightness-110 transition"
          >
            <Upload className="w-4 h-4" /> Mes Biens
          </Link>
          <Link
            href="/agency/library"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/80 text-sm hover:bg-white/5 transition"
          >
            <Building className="w-4 h-4" /> Bibliothèque 3D
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 text-sm hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-60 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/5 bg-[color:var(--color-agency-bg)]/80 backdrop-blur-md flex items-center px-6 gap-2 sticky top-0 z-30">
          <Link
            href="/agency/properties"
            className="px-3 py-1.5 text-xs rounded-md bg-[color:var(--color-agency-accent)] text-white font-medium hover:brightness-110"
          >
            Mes Biens
          </Link>
          <Link
            href="/agency/conversations"
            className="px-3 py-1.5 text-xs rounded-md text-white/70 hover:bg-white/5"
          >
            Conversations
          </Link>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <Link
            href="/agency/library"
            className="px-3 py-1.5 text-xs rounded-md text-white/70 hover:bg-white/5"
          >
            Vue 3D
          </Link>
          <Link
            href="/agency/stats"
            className="px-3 py-1.5 text-xs rounded-md text-white/70 hover:bg-white/5"
          >
            Stats
          </Link>
          <Link
            href="/agency/settings"
            className="px-3 py-1.5 text-xs rounded-md text-white/70 hover:bg-white/5"
          >
            Paramètres
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
            Assistant en ligne
          </div>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs rounded-md text-red-400 hover:bg-red-500/10 inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </header>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="AGENCY">
      <AgencyLayoutInner>{children}</AgencyLayoutInner>
    </RequireAuth>
  );
}
