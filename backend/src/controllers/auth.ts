import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/error.js";
import { getUserById, loginUser, registerUser } from "../services/auth.js";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(1).max(120).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = RegisterSchema.parse(req.body);
    const result = await registerUser(body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = LoginSchema.parse(req.body);
    const result = await loginUser(body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    const user = await getUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export function googleCallbackHandler(req: Request, res: Response) {
  const result = req.user as unknown as { token: string } | undefined;
  const token = result?.token;
  if (!token) {
    res.redirect(`${env.FRONTEND_URL}/login?error=oauth`);
    return;
  }
  res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`);
}
