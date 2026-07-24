import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/error.js";
import { isFavorited, listFavorites, toggleFavorite } from "../services/favorites.js";

export async function toggleFavoriteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    const propertyId = z.string().min(1).parse(req.params.propertyId);
    res.json(await toggleFavorite(req.user.id, propertyId));
  } catch (err) {
    next(err);
  }
}

export async function listFavoritesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    res.json(await listFavorites(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function favoriteStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    const propertyId = z.string().min(1).parse(req.params.propertyId);
    res.json(await isFavorited(req.user.id, propertyId));
  } catch (err) {
    next(err);
  }
}
