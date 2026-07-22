import { env } from "../config/env.js";
import { HttpError } from "../middleware/error.js";
import { stripe } from "../shared/stripe.js";
import { getProperty } from "./properties.js";

export interface CreateCheckoutInput {
  propertyId: string;
  /** Montant en unité principale (DH). Si absent, acompte = STRIPE_DEPOSIT_PERCENT % du prix. */
  amount?: number;
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  if (!stripe) {
    throw new HttpError(503, "Paiements indisponibles (Stripe non configuré)");
  }

  const property = await getProperty(input.propertyId);
  if (!property) throw new HttpError(404, "Bien introuvable");

  const deposit =
    input.amount ?? Math.round((property.price * env.STRIPE_DEPOSIT_PERCENT) / 100);

  if (deposit <= 0) throw new HttpError(400, "Montant invalide");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: env.STRIPE_CURRENCY,
          // Stripe attend l'unité la plus petite (centimes)
          unit_amount: deposit * 100,
          product_data: {
            name: `Acompte de réservation - ${property.name}`,
            description: `${property.type} à ${property.city} (${property.neighborhood})`,
          },
        },
      },
    ],
    success_url: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
    metadata: {
      propertyId: property.id,
      propertyName: property.name,
    },
  });

  return { id: session.id, url: session.url, amount: deposit, currency: env.STRIPE_CURRENCY };
}
