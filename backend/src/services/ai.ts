import { createHash } from "node:crypto";
import { prisma } from "@viewbeforebuy/database";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAiGatewayProvider } from "../ai/gateway.js";
import { SYSTEM_PROMPTS } from "../ai/prompts.js";
import { env } from "../config/env.js";
import { logger } from "../shared/logger.js";
import { cached } from "../shared/redis.js";
import { calculateEligibility, formatDH, type EligibilityResult } from "./credit.js";

/** L'IA est active si une clé OpenAI OU la passerelle Lovable est configurée. */
export const isAiEnabled = Boolean(env.OPENAI_API_KEY || env.LOVABLE_API_KEY);

/** Durée de mise en cache des réponses IA (1 heure) pour économiser le quota API. */
const AI_CACHE_TTL = 3600;

type PropertyRow = Awaited<ReturnType<typeof prisma.property.findMany>>[number];
type BankRow = Awaited<ReturnType<typeof prisma.bank.findMany>>[number];

export interface FinancialDetails {
  monthlyIncome?: number;
  existingDebts?: number;
  downPayment?: number;
  duration?: number;
  loanAmount?: number;
  propertyPrice?: number;
}

export interface AiTextResult {
  text: string;
  /** "ai" si généré par le modèle, "fallback" si repli déterministe (IA désactivée/indisponible). */
  source: "ai" | "fallback";
}

export interface RecommendationResult extends AiTextResult {
  matches: Array<{ id: string; name: string; price: number; city: string }>;
}

export interface FinancialAssistantResult extends AiTextResult {
  eligibility: EligibilityResult | null;
}

/**
 * Sélectionne le modèle de langage :
 * 1. OpenAI si `OPENAI_API_KEY` est défini ;
 * 2. sinon la passerelle Lovable existante si `LOVABLE_API_KEY` ;
 * 3. sinon `null` → repli déterministe.
 */
function getModel() {
  if (env.OPENAI_API_KEY) {
    const openai = createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    });
    return openai(env.AI_MODEL);
  }
  if (env.LOVABLE_API_KEY) {
    return createAiGatewayProvider(env.LOVABLE_API_KEY)("openai/gpt-5.5");
  }
  return null;
}

function hashKey(prefix: string, payload: unknown): string {
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 24);
  return `ai:${prefix}:${digest}`;
}

/** Appelle le modèle avec dégradation gracieuse : renvoie `fallback` si l'IA est absente ou en erreur. */
async function runAi(system: string, prompt: string, fallback: string): Promise<AiTextResult> {
  const model = getModel();
  if (!model) return { text: fallback, source: "fallback" };
  try {
    const { text } = await generateText({ model, system, prompt });
    const clean = text?.trim();
    return clean ? { text: clean, source: "ai" } : { text: fallback, source: "fallback" };
  } catch (err) {
    logger.error(`IA indisponible, repli déterministe: ${(err as Error).message}`);
    return { text: fallback, source: "fallback" };
  }
}

function buildPropertyContext(properties: PropertyRow[], banks: BankRow[], budget: number): string {
  const props = properties
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} — ${p.type}, ${p.city}/${p.neighborhood}, ${p.rooms} pièces, ${p.superficie} m², ${formatDH(p.price)} (score localisation ${p.locationScore}/10)`,
    )
    .join("\n");
  const bankList = banks.map((b) => `- ${b.name}: taux ${b.rate}%, durée max ${b.maxDuration} ans`).join("\n");
  return [
    budget > 0 ? `Budget du client: ${formatDH(budget)}.` : "Budget non précisé.",
    "",
    "Biens disponibles (issus de la base):",
    props || "Aucun bien ne correspond au budget.",
    "",
    "Banques partenaires:",
    bankList || "Aucune banque référencée.",
  ].join("\n");
}

function buildRecommendationFallback(properties: PropertyRow[], budget: number): string {
  if (properties.length === 0) {
    return budget > 0
      ? `Aucun bien ne correspond à un budget de ${formatDH(budget)} pour le moment. Élargissez votre budget ou la zone de recherche.`
      : "Aucun bien disponible pour le moment.";
  }
  const top = properties
    .slice(0, 3)
    .map((p) => `• ${p.name} à ${p.city} — ${formatDH(p.price)} (${p.rooms} pièces, ${p.superficie} m²)`)
    .join("\n");
  return `Voici les biens les plus pertinents disponibles :\n${top}`;
}

/**
 * Assistant "copilote immobilier" (RAG simplifié) : récupère les biens et banques
 * depuis Prisma et les injecte en contexte pour recommander des biens pertinents.
 */
export async function generatePropertyRecommendation(
  userPrompt: string,
  userBudget: number,
): Promise<RecommendationResult> {
  return cached(hashKey("reco", { userPrompt, userBudget }), AI_CACHE_TTL, async () => {
    const where = userBudget > 0 ? { price: { lte: userBudget } } : {};
    const [properties, banks] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: [{ locationScore: "desc" }, { price: "asc" }],
        take: 8,
      }),
      prisma.bank.findMany({ orderBy: { rate: "asc" }, take: 5 }),
    ]);

    const context = buildPropertyContext(properties, banks, userBudget);
    const fallback = buildRecommendationFallback(properties, userBudget);
    const prompt = `${context}\n\nDemande du client: ${userPrompt}\n\nRecommande les biens les plus pertinents et explique brièvement pourquoi, en français.`;

    const result = await runAi(SYSTEM_PROMPTS.client, prompt, fallback);
    return {
      ...result,
      matches: properties.map((p) => ({ id: p.id, name: p.name, price: p.price, city: p.city })),
    };
  });
}

function computeEligibility(details: FinancialDetails): EligibilityResult | null {
  if (typeof details.monthlyIncome !== "number" || typeof details.duration !== "number") {
    return null;
  }
  return calculateEligibility({
    monthlyIncome: details.monthlyIncome,
    existingDebts: details.existingDebts ?? 0,
    downPayment: details.downPayment ?? 0,
    duration: details.duration,
    loanAmount: details.loanAmount,
  });
}

function buildFinancialFallback(details: FinancialDetails, eligibility: EligibilityResult | null): string {
  if (!eligibility) {
    return "Pour évaluer votre capacité d'emprunt, indiquez votre revenu mensuel et la durée souhaitée du crédit.";
  }
  const statusLabel =
    eligibility.status === "eligible"
      ? "éligible"
      : eligibility.status === "borderline"
        ? "limite"
        : "insuffisant";
  const lines = [
    `Votre profil est actuellement ${statusLabel} (score ${eligibility.score}/100).`,
    `Mensualité maximale estimée: ${formatDH(eligibility.maxMonthly)}.`,
    `Montant empruntable estimé: ${formatDH(eligibility.maxLoan)} (règle BAM: 33% d'endettement max).`,
  ];
  if (eligibility.status !== "eligible") {
    lines.push(
      "Pistes d'optimisation: augmenter l'apport, allonger la durée, ou réduire vos dettes existantes.",
    );
  }
  return lines.join("\n");
}

/**
 * Conseille le client sur sa capacité d'emprunt et ses mensualités.
 * Calcule l'éligibilité de façon déterministe puis demande à l'IA des conseils d'optimisation.
 */
export async function answerFinancialAssistant(
  query: string,
  creditDetails: FinancialDetails,
): Promise<FinancialAssistantResult> {
  return cached(hashKey("fin", { query, creditDetails }), AI_CACHE_TTL, async () => {
    const eligibility = computeEligibility(creditDetails);
    const fallback = buildFinancialFallback(creditDetails, eligibility);

    const context = [
      "Données financières du client:",
      JSON.stringify(creditDetails),
      eligibility ? `Éligibilité calculée: ${JSON.stringify(eligibility)}` : "Éligibilité non calculable (données incomplètes).",
    ].join("\n");
    const prompt = `${context}\n\nQuestion: ${query}\n\nConseille le client sur sa capacité d'emprunt, ses mensualités et comment optimiser son score, en français, de façon concise.`;

    const result = await runAi(SYSTEM_PROMPTS.client, prompt, fallback);
    return { ...result, eligibility };
  });
}
