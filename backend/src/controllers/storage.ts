import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/error.js";
import { uploadPropertyImage } from "../services/storage.js";

export async function uploadPropertyImageHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = z.string().min(1).parse(req.params.id);
    const file = req.file;
    if (!file) throw new HttpError(400, "Aucun fichier fourni (champ 'image')");
    const updated = await uploadPropertyImage(id, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
}
