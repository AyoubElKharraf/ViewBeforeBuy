import { Router } from "express";
import {
  deleteNotificationHandler,
  getNotificationsHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from "../controllers/notifications.js";
import { protect } from "../shared/middlewares/auth.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", protect, getNotificationsHandler);
notificationsRouter.patch("/read-all", protect, markAllNotificationsReadHandler);
notificationsRouter.patch("/:id/read", protect, markNotificationReadHandler);
notificationsRouter.delete("/:id", protect, deleteNotificationHandler);
