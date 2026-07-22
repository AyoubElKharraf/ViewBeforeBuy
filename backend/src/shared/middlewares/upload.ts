import multer from "multer";

// Stockage en mémoire : le buffer est ensuite envoyé à Supabase
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});
