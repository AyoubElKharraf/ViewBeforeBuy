"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Building,
  FileText,
  CreditCard,
  Sparkles,
  LogOut,
  Heart,
  Map,
} from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";
import { CompareBar } from "@/components/CompareBar";
import { useFavorites } from "@/hooks/useFavorites";

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

type NavItem = { href: string; label: string; icon: typeof Home; exact?: boolean };

const NAV: NavItem[] = [
  { href: "/client", label: "Accueil", icon: Home, exact: true },
  { href: "/client/browse", label: "Biens", icon: Building },
  { href: "/client/map", label: "Carte", icon: Map },
  { href: "/client/favorites", label: "Favoris", icon: Heart },
  { href: "/client/simulator", label: "Crédits", icon: CreditCard },
];

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { count: favCount } = useFavorites();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen client-surface pb-28">
      <header className="sticky top-0 z-30 bg-[color:var(--color-client-bg)]/80 backdrop-blur-md border-b border-[color:var(--color-client-border)]">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <span className="text-[color:var(--color-client-gold)]">ViewBeforeBuy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/client/score"
              className="hidden sm:inline-flex text-xs opacity-60 hover:opacity-100 items-center gap-1 px-2"
            >
              <FileText className="w-3.5 h-3.5" /> Éligibilité
            </Link>
            <Link
              href="/client/ai-assistant"
              className="hidden sm:inline-flex text-xs opacity-60 hover:opacity-100 items-center gap-1 px-2"
            >
              <Sparkles className="w-3.5 h-3.5" /> IA
            </Link>
            <NotificationBell accent="client" />
            <div
              className="w-9 h-9 rounded-full bg-[color:var(--color-client-gold)] text-white flex items-center justify-center text-xs font-semibold"
              title={user?.email ?? ""}
            >
              {user ? initials(user.name, user.email) : "?"}
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="w-9 h-9 rounded-full client-card flex items-center justify-center text-[color:var(--color-client-text-muted)] hover:text-red-500 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-5xl mx-auto px-5 py-6"
      >
        {children}
      </motion.main>

      <CompareBar />

      <nav className="fixed bottom-0 inset-x-0 border-t border-[color:var(--color-client-border)] bg-[color:var(--color-client-bg)]/95 backdrop-blur-md z-30">
        <div className="max-w-5xl mx-auto grid grid-cols-5">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const label =
              item.href === "/client/favorites" && favCount > 0
                ? `Favoris (${favCount})`
                : item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] sm:text-xs transition ${
                  active
                    ? "text-[color:var(--color-client-gold)]"
                    : "text-[color:var(--color-client-text-muted)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </RequireAuth>
  );
}
