import { prisma } from "@viewbeforebuy/database";
import type { Prisma } from "@prisma/client";
import { logger } from "../shared/logger.js";
import { emitNotification } from "../shared/socket.js";

export type AppNotificationType =
  | "NEW_MESSAGE"
  | "PROPERTY_LIKED"
  | "REPORT_READY"
  | "CREDIT_ALERT"
  | "REVIEW_RECEIVED"
  | "SYSTEM";

export async function createNotification(input: {
  userId: string;
  type: AppNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: (input.data ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  emitNotification(input.userId, notification);
  logger.info(`Notification créée pour ${input.userId}: ${input.type}`);
  return notification;
}

export async function notifyAgencyUsers(
  type: AppNotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>,
) {
  const agencies = await prisma.user.findMany({
    where: { role: { in: ["AGENCY", "ADMIN"] } },
    select: { id: true },
  });
  await Promise.all(
    agencies.map((u) => createNotification({ userId: u.id, type, title, message, data })),
  );
}

export async function listNotifications(userId: string, page = 1, pageSize = 20) {
  const skip = (Math.max(1, page) - 1) * pageSize;
  const [total, items, unreadCount] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);
  return { items, total, unreadCount, page, pageSize };
}

export async function markNotificationRead(userId: string, id: string) {
  const existing = await prisma.notification.findFirst({ where: { id, userId } });
  if (!existing) return null;
  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  return { ok: true };
}

export async function deleteNotification(userId: string, id: string) {
  const existing = await prisma.notification.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.notification.delete({ where: { id } });
  return true;
}
