import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProd } from "./config/env.js";
import { passport } from "./config/passport.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { apiRouter } from "./routes/index.js";
import { morganStream } from "./shared/logger.js";
import { aiLimiter, apiLimiter } from "./shared/middlewares/rateLimiter.js";

export function createApp() {
  const app = express();

  // Sécurité & performance
  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  // Authentification (Passport en mode stateless / JWT)
  app.use(passport.initialize());

  // Journalisation HTTP
  app.use(morgan(isProd ? "combined" : "dev", { stream: morganStream }));

  // Rate limiting
  app.use("/api/", apiLimiter);
  app.use("/api/chat", aiLimiter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "viewbeforebuy-api" });
  });

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
