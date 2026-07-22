import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const isSupabaseEnabled = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(env.SUPABASE_URL as string, env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false },
    })
  : null;

if (isSupabaseEnabled) {
  logger.info("Supabase Storage activé");
} else {
  logger.info("Supabase Storage désactivé (SUPABASE_URL/KEY manquants)");
}
