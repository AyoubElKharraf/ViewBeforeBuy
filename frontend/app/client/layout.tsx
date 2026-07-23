"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Building, FileText, CreditCard, User, Bell, LogOut } from "lucide-react";
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

type NavItem = { href: string; label: string; icon: typeof Home; exact?: boolean };

const NAV: NavItem[] = [
  { href: "/client", label: "Accueil", icon: Home, exact: true },
  { href: "/client/simulator", label: "Crédits", icon: CreditCard },
  { href: "/client/score", label: "Éligibilité", icon: FileText },
  { href: "/client/browse", label: "Biens", icon: Building },
  { href: "/client/profile", label: "Profil", icon: User },
];

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen client-surface pb-24">
      <header className="sticky top-0 z-30 bg-[color:var(--color-client-bg)]/80 backdrop-blur-md border-b border-[color:var(--color-client-border)]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <span className="text-[color:var(--color-client-gold)]">ViewBeforeBuy</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full client-card flex items-center justify-center">
              <Bell className="w-4 h-4 text-[color:var(--color-client-text)]" />
            </button>
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
        className="max-w-3xl mx-auto px-5 py-6"
      >
        {children}
      </motion.main>

      <nav className="fixed bottom-0 inset-x-0 border-t border-[color:var(--color-client-border)] bg-[color:var(--color-client-bg)]/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto grid grid-cols-5">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 text-xs transition ${
                  active
                    ? "text-[color:var(--color-client-gold)]"
                    : "text-[color:var(--color-client-text-muted)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
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
