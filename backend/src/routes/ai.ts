import { Router } from "express";
import { aiChatHandler, aiScoreEligibilityHandler } from "../controllers/ai.js";
import { protect } from "../shared/middlewares/auth.js";

export const aiRouter = Router();

// Toutes les routes IA sont protégées (JWT via `protect`).
aiRouter.post("/chat", protect, aiChatHandler);
aiRouter.post("/score-eligibility", protect, aiScoreEligibilityHandler);
