import { prisma } from "@viewbeforebuy/database";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/error.js";
import { cacheDel } from "../shared/redis.js";
import { supabase } from "../shared/supabase.js";

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadPropertyImage(propertyId: string, file: UploadedFile) {
  if (!supabase) {
    throw new HttpError(503, "Stockage indisponible (Supabase non configuré)");
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new HttpError(400, "Format d'image non supporté (jpeg, png, webp, gif)");
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new HttpError(404, "Bien introuvable");

  const ext = file.originalname.split(".").pop() || "jpg";
  const path = `${propertyId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(env.SUPABASE_BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: true,
  });
  if (error) throw new HttpError(502, `Échec de l'upload: ${error.message}`);

  const { data } = supabase.storage.from(env.SUPABASE_BUCKET).getPublicUrl(path);
  const imageUrl = data.publicUrl;

  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: { imageUrl },
  });

  // Invalide le cache Redis des propriétés
  await cacheDel("properties:*");

  return updated;
}
