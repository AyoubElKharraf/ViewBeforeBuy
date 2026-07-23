"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const redirect = searchParams.get("redirect") || "/client";
    if (!token) {
      setError(true);
      const t = setTimeout(() => router.replace("/login?error=oauth"), 1200);
      return () => clearTimeout(t);
    }
    setToken(token);
    void refresh().finally(() => router.replace(redirect));
  }, [searchParams, refresh, router]);

  return (
    <div className="min-h-screen agency-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-white/70">
        {error ? (
          <span className="text-sm text-red-300">Échec de la connexion, redirection…</span>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Connexion en cours…</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen agency-surface flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-white/70" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
