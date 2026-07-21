import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  appendMessage,
  getConversation,
  listConversations,
} from "../services/conversations.js";
import { HttpError } from "../middleware/error.js";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
  timestamp: z.string().min(1),
});

export async function getConversationsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const conversations = await listConversations();
    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

export async function getConversationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = z.string().min(1).parse(req.params.id);
    const conversation = await getConversation(id);
    if (!conversation) throw new HttpError(404, "Conversation not found");
    res.json(conversation);
  } catch (err) {
    next(err);
  }
}

export async function postMessageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = z.string().min(1).parse(req.params.id);
    const body = MessageSchema.parse(req.body);
    const conversation = await getConversation(id);
    if (!conversation) throw new HttpError(404, "Conversation not found");
    const updated = await appendMessage(id, body);
    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
}
