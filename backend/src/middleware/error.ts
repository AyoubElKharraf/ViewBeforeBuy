import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../shared/logger.js";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  logger.error(err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err));
  res.status(500).json({ error: message });
}
