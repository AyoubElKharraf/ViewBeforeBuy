import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middleware/error.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "viewbeforebuy-api" });
  });

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
