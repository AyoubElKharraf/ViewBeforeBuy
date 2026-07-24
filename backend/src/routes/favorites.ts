import { Router } from "express";
import {
  favoriteStatusHandler,
  listFavoritesHandler,
  toggleFavoriteHandler,
} from "../controllers/favorites.js";
import { protect } from "../shared/middlewares/auth.js";

export const favoritesRouter = Router();

favoritesRouter.get("/", protect, listFavoritesHandler);
favoritesRouter.post("/:propertyId", protect, toggleFavoriteHandler);
favoritesRouter.get("/:propertyId/status", protect, favoriteStatusHandler);
