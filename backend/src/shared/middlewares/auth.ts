import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/error.js";
import { verifyToken } from "../../services/auth.js";

export function protect(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "Authentification requise");
    }
    const token = header.slice(7);
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(new HttpError(401, "Token invalide ou expiré"));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "Authentification requise"));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, "Accès refusé"));
    next();
  };
}
