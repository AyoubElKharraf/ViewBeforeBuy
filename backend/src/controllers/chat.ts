import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { chat } from "../services/chat.js";

const ChatSchema = z.object({
  message: z.string().min(1).max(4000),
  role: z.enum(["agency", "client", "report"]).default("agency"),
  context: z.string().max(4000).optional(),
});

export async function postChatHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = ChatSchema.parse(req.body);
    const result = await chat(body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
