import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getProperty, listProperties } from "../services/properties.js";
import { HttpError } from "../middleware/error.js";

const QuerySchema = z.object({
  type: z.string().optional(),
  city: z.string().optional(),
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
