import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Redis (étape 3) - laisser vide pour désactiver le cache/rate-limit distribué
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),

  // Stripe (étape 4) - laisser vide pour désactiver les paiements
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_CURRENCY: z.string().default("mad"),
  STRIPE_DEPOSIT_PERCENT: z.coerce.number().min(1).max(100).default(10),

  // Auth (étape 2)
  JWT_SECRET: z.string().min(1).default("dev-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // OAuth2 Google (optionnel)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .default("http://localhost:4000/api/auth/google/callback"),

  // Optionnel pour l'instant (rempli aux étapes suivantes)
  LOVABLE_API_KEY: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
