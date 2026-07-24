import { prisma } from "@viewbeforebuy/database";
import { cacheDel, cached } from "../shared/redis.js";
import { HttpError } from "../middleware/error.js";
import { notifyAgencyUsers } from "./notifications.js";

export async function toggleFavorite(userId: string, propertyId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new HttpError(404, "Bien introuvable");

  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    await cacheDel(`favorites:${userId}`);
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId, propertyId } });
  await cacheDel(`favorites:${userId}`);
  await notifyAgencyUsers(
    "PROPERTY_LIKED",
    "Nouveau favori",
    `Un client a ajouté « ${property.name} » à ses favoris.`,
    { propertyId },
  );
  return { favorited: true };
}

export async function listFavorites(userId: string) {
  return cached(`favorites:${userId}`, 120, async () => {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => r.property);
  });
}

export async function isFavorited(userId: string, propertyId: string) {
  const row = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });
  return { favorited: Boolean(row) };
}
