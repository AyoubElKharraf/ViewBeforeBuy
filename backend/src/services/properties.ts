import { prisma } from "@viewbeforebuy/database";
import { cached } from "../shared/redis.js";

export type PropertyFilters = {
  type?: string;
  city?: string;
};

const PROPERTIES_TTL = 60; // secondes

export async function listProperties(filters: PropertyFilters = {}) {
  const where: { type?: string; city?: string } = {};
  if (filters.type && filters.type !== "Tous") where.type = filters.type;
  if (filters.city && filters.city !== "Tous") where.city = filters.city;

  const key = `properties:list:${where.type ?? "*"}:${where.city ?? "*"}`;
  return cached(key, PROPERTIES_TTL, () =>
    prisma.property.findMany({
      where,
      orderBy: { price: "asc" },
    }),
  );
}

export async function getProperty(id: string) {
  return cached(`properties:one:${id}`, PROPERTIES_TTL, () =>
    prisma.property.findUnique({ where: { id } }),
  );
}
