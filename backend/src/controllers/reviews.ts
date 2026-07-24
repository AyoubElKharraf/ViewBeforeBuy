import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/error.js";
import { deleteReview, listReviews, upsertReview } from "../services/reviews.js";

const ReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function upsertReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    const propertyId = z.string().min(1).parse(req.params.propertyId);
    const body = ReviewSchema.parse(req.body);
    const review = await upsertReview({
      userId: req.user.id,
      propertyId,
      rating: body.rating,
      comment: body.comment,
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

export async function listReviewsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const propertyId = z.string().min(1).parse(req.params.propertyId);
    res.json(await listReviews(propertyId));
  } catch (err) {
    next(err);
  }
}

export async function deleteReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    const id = z.string().min(1).parse(req.params.id);
    res.json(await deleteReview(req.user.id, id));
  } catch (err) {
    next(err);
  }
}
