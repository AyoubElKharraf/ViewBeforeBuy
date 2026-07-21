"use client";

import { useState } from "react";
import { postChat, type ChatRole } from "@/lib/api";

export function useAI(role: ChatRole = "agency") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (message: string, context?: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const res = await postChat({ message, role, context });
      return res.text;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur de connexion";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { send, loading, error };
}
