import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  compareProperties,
  getProperty,
  listMapProperties,
  listProperties,
  searchProperties,
} from "../services/properties.js";
import { HttpError } from "../middleware/error.js";

const QuerySchema = z.object({
  type: z.string().optional(),
  city: z.string().optional(),
});

const boolFromQuery = z
  .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0"), z.boolean()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (typeof v === "boolean") return v;
    return v === "true" || v === "1";
  });

const SearchSchema = z.object({
  city: z.string().optional(),
  type: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minSuperficie: z.coerce.number().optional(),
  maxSuperficie: z.coerce.number().optional(),
  rooms: z.coerce.number().int().optional(),
  hasPool: boolFromQuery,
  hasGarden: boolFromQuery,
  hasParking: boolFromQuery,
  page: z.coerce.number().int().optional(),
  pageSize: z.coerce.number().int().optional(),
});

const CompareSchema = z.object({
  propertyIds: z.array(z.string().min(1)).min(1).max(3),
});

export async function getPropertiesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = QuerySchema.parse(req.query);
    const properties = await listProperties(query);
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

export async function searchPropertiesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = SearchSchema.parse(req.query);
    const result = await searchProperties(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function mapPropertiesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const properties = await listMapProperties();
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

export async function comparePropertiesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CompareSchema.parse(req.body);
    const properties = await compareProperties(body.propertyIds);
    res.json({ properties });
  } catch (err) {
    next(err);
  }
}

export async function getPropertyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = z.string().min(1).parse(req.params.id);
    const property = await getProperty(id);
    if (!property) throw new HttpError(404, "Property not found");
    res.json(property);
  } catch (err) {
    next(err);
  }
}
