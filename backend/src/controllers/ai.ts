import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { answerFinancialAssistant, generatePropertyRecommendation } from "../services/ai.js";
import { calculateEligibility } from "../services/credit.js";

const HistoryItem = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const ChatSchema = z.object({
  message: z.string().min(1).max(4000),
  budget: z.coerce.number().min(0).optional(),
  history: z.array(HistoryItem).max(20).optional(),
});

/** POST /api/ai/chat — assistant virtuel (RAG biens/banques) avec historique de conversation. */
export async function aiChatHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = ChatSchema.parse(req.body);

    // On injecte l'historique dans le prompt pour garder le contexte de conversation.
    const historyText = (body.history ?? [])
      .map((m) => `${m.role === "user" ? "Client" : "Assistant"}: ${m.content}`)
      .join("\n");
    const userPrompt = historyText ? `${historyText}\nClient: ${body.message}` : body.message;

    const result = await generatePropertyRecommendation(userPrompt, body.budget ?? 0);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

const ScoreSchema = z.object({
  monthlyIncome: z.coerce.number().positive(),
  existingDebts: z.coerce.number().min(0).default(0),
  downPayment: z.coerce.number().min(0).default(0),
  duration: z.coerce.number().int().min(1).max(40),
  loanAmount: z.coerce.number().min(0).optional(),
  propertyPrice: z.coerce.number().min(0).optional(),
  query: z.string().max(4000).optional(),
});

/** POST /api/ai/score-eligibility — score déterministe + recommandations d'optimisation par l'IA. */
export async function aiScoreEligibilityHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = ScoreSchema.parse(req.body);

    const eligibility = calculateEligibility({
      monthlyIncome: body.monthlyIncome,
      existingDebts: body.existingDebts,
      downPayment: body.downPayment,
      duration: body.duration,
      loanAmount: body.loanAmount,
    });

    const assistant = await answerFinancialAssistant(
      body.query ?? "Comment optimiser mon score d'éligibilité au crédit immobilier ?",
      {
        monthlyIncome: body.monthlyIncome,
        existingDebts: body.existingDebts,
        downPayment: body.downPayment,
        duration: body.duration,
        loanAmount: body.loanAmount,
        propertyPrice: body.propertyPrice,
      },
    );

    res.json({ eligibility, recommendations: assistant.text, source: assistant.source });
  } catch (err) {
    next(err);
  }
}
