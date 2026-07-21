import { prisma } from "@viewbeforebuy/database";

export type PropertyFilters = {
  type?: string;
  city?: string;
};

export async function listProperties(filters: PropertyFilters = {}) {
  const where: { type?: string; city?: string } = {};
  if (filters.type && filters.type !== "Tous") where.type = filters.type;
  if (filters.city && filters.city !== "Tous") where.city = filters.city;

  return prisma.property.findMany({
    where,
    orderBy: { price: "asc" },
  });
}

export async function getProperty(id: string) {
  return prisma.property.findUnique({ where: { id } });
}
