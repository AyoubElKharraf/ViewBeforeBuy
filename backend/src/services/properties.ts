import { createHash } from "node:crypto";
import { prisma } from "@viewbeforebuy/database";
import { cached, cacheDel } from "../shared/redis.js";
import { calculateCredit } from "./credit.js";

export type PropertyFilters = {
  type?: string;
  city?: string;
};

export type SearchFilters = {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minSuperficie?: number;
  maxSuperficie?: number;
  rooms?: number;
  hasPool?: boolean;
  hasGarden?: boolean;
  hasParking?: boolean;
  page?: number;
  pageSize?: number;
};

const PROPERTIES_TTL = 60;
const SEARCH_TTL = 300;
const MAP_TTL = 600;

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

export async function invalidatePropertyCaches(propertyId?: string) {
  await cacheDel("properties:*");
  await cacheDel("search:*");
  if (propertyId) await cacheDel(`properties:one:${propertyId}`);
}

function searchCacheKey(filters: SearchFilters): string {
  const digest = createHash("sha256").update(JSON.stringify(filters)).digest("hex").slice(0, 24);
  return `search:${digest}`;
}

export async function searchProperties(filters: SearchFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 12));
  const normalized = { ...filters, page, pageSize };

  return cached(searchCacheKey(normalized), SEARCH_TTL, async () => {
    const where: Record<string, unknown> = {};
    if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
    if (filters.type && filters.type !== "Tous") where.type = filters.type;
    if (filters.minPrice != null || filters.maxPrice != null) {
      where.price = {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      };
    }
    if (filters.minSuperficie != null || filters.maxSuperficie != null) {
      where.superficie = {
        ...(filters.minSuperficie != null ? { gte: filters.minSuperficie } : {}),
        ...(filters.maxSuperficie != null ? { lte: filters.maxSuperficie } : {}),
      };
    }
    if (filters.rooms != null) where.rooms = { gte: filters.rooms };
    if (filters.hasPool === true) where.hasPool = true;
    if (filters.hasGarden === true) where.hasGarden = true;
    if (filters.hasParking === true) where.hasParking = true;

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        orderBy: { price: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { properties, total, page, pageSize };
  });
}

export async function listMapProperties() {
  return cached("properties:map", MAP_TTL, () =>
    prisma.property.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      select: {
        id: true,
        name: true,
        price: true,
        type: true,
        city: true,
        lat: true,
        lng: true,
        imageUrl: true,
        avgRating: true,
        reviewCount: true,
      },
      orderBy: { price: "asc" },
    }),
  );
}

export async function compareProperties(propertyIds: string[]) {
  const unique = [...new Set(propertyIds)].slice(0, 3);
  const properties = await prisma.property.findMany({
    where: { id: { in: unique } },
  });

  return properties.map((p) => {
    const credit = calculateCredit({
      propertyPrice: p.price,
      downPayment: Math.round(p.price * 0.2),
      duration: 20,
      annualRate: 4.3,
    });
    return {
      ...p,
      estimatedMonthly: credit.monthlyPayment,
      loanAmount: credit.loanAmount,
    };
  });
}
