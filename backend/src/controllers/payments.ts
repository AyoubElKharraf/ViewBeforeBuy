import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { createCheckoutSession } from "../services/payments.js";

const CheckoutSchema = z.object({
  propertyId: z.string().min(1),
  amount: z.number().int().positive().optional(),
});

export async function createCheckoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CheckoutSchema.parse(req.body);
    const session = await createCheckoutSession(body);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}
