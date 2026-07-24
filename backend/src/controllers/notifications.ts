import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/error.js";
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications.js";

export async function getNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    const page = z.coerce.number().int().optional().parse(req.query.page);
    const pageSize = z.coerce.number().int().optional().parse(req.query.pageSize);
    const result = await listNotifications(req.user.id, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markNotificationReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    const id = z.string().min(1).parse(req.params.id);
    const updated = await markNotificationRead(req.user.id, id);
    if (!updated) throw new HttpError(404, "Notification introuvable");
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsReadHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    res.json(await markAllNotificationsRead(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Authentification requise");
    const id = z.string().min(1).parse(req.params.id);
    const ok = await deleteNotification(req.user.id, id);
    if (!ok) throw new HttpError(404, "Notification introuvable");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
