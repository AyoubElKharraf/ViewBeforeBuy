import { Router } from "express";
import {
  deleteReviewHandler,
  listReviewsHandler,
  upsertReviewHandler,
} from "../controllers/reviews.js";
import { protect, requireRole } from "../shared/middlewares/auth.js";

export const reviewsRouter = Router();

reviewsRouter.get("/:propertyId", listReviewsHandler);
reviewsRouter.post(
  "/:propertyId",
  protect,
  requireRole("CLIENT", "ADMIN"),
  upsertReviewHandler,
);
reviewsRouter.delete("/:id", protect, deleteReviewHandler);
