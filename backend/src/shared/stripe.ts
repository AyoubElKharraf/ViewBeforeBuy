import Stripe from "stripe";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const isStripeEnabled = Boolean(env.STRIPE_SECRET_KEY);

export const stripe: Stripe | null = isStripeEnabled
  ? new Stripe(env.STRIPE_SECRET_KEY as string)
  : null;

if (isStripeEnabled) {
  logger.info("Stripe activé (paiements disponibles)");
} else {
  logger.info("Stripe désactivé (STRIPE_SECRET_KEY manquante)");
}
