"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Protège une portion de l'app :
 * - redirige vers /login si l'utilisateur n'est pas authentifié (en conservant ?redirect=)
 * - si `role` est fourni, redirige vers l'espace de l'utilisateur si son rôle ne correspond pas
 *   (ADMIN a accès à tout).
 */
export function RequireAuth({
  children,
  role,
}: {
  children: ReactNode;
  role?: "AGENCY" | "CLIENT";
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const roleAllowed =
    !role || !user || user.role === "ADMIN" || user.role === role;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!roleAllowed) {
      // Mauvais espace pour ce rôle : on renvoie vers son espace par défaut
      router.replace(user.role === "AGENCY" ? "/agency" : "/client");
    }
  }, [loading, user, roleAllowed, pathname, router]);

  if (loading || !user || !roleAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-agency-bg)]">
        <div className="flex flex-col items-center gap-3 text-white/70">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
