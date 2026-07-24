import { prisma } from "@viewbeforebuy/database";
import { HttpError } from "../middleware/error.js";
import { invalidatePropertyCaches } from "./properties.js";
import { notifyAgencyUsers } from "./notifications.js";

export async function upsertReview(input: {
  userId: string;
  propertyId: string;
  rating: number;
  comment?: string;
}) {
  const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
  if (!property) throw new HttpError(404, "Bien introuvable");

  const review = await prisma.review.upsert({
    where: { userId_propertyId: { userId: input.userId, propertyId: input.propertyId } },
    create: {
      userId: input.userId,
      propertyId: input.propertyId,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    update: {
      rating: input.rating,
      comment: input.comment ?? null,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  await refreshPropertyRating(input.propertyId);
  await invalidatePropertyCaches(input.propertyId);
  await notifyAgencyUsers(
    "REVIEW_RECEIVED",
    "Nouvel avis",
    `Un avis ${input.rating}/5 a été publié sur « ${property.name} ».`,
    { propertyId: input.propertyId, reviewId: review.id },
  );

  return review;
}

export async function listReviews(propertyId: string) {
  return prisma.review.findMany({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function deleteReview(userId: string, reviewId: string) {
  const existing = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!existing) throw new HttpError(404, "Avis introuvable");
  await prisma.review.delete({ where: { id: reviewId } });
  await refreshPropertyRating(existing.propertyId);
  await invalidatePropertyCaches(existing.propertyId);
  return { ok: true };
}

async function refreshPropertyRating(propertyId: string) {
  const agg = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      avgRating: agg._avg.rating ?? null,
      reviewCount: agg._count._all,
    },
  });
}
