import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { logger } from "../logger.js";
import { redis } from "../redis.js";

function makeStore(prefix: string) {
  const client = redis;
  if (!client) return undefined;
  return new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => client.call(...(args as [string, ...string[]])) as any,
    prefix,
  });
}

/**
 * Enveloppe un limiteur pour qu'il "échoue en mode ouvert" :
 * si le store (Redis) est indisponible, la requête est autorisée
 * au lieu de renvoyer une erreur 500.
 */
function failOpen(limiter: RequestHandler): RequestHandler {
  return (req, res, next) => {
    limiter(req, res, (err?: unknown) => {
      if (err) {
        logger.warn(`Rate limiter indisponible, requête autorisée: ${String(err)}`);
        return next();
      }
      next();
    });
  };
}

// Limite générale : 100 requêtes / 15 min par IP
export const apiLimiter = failOpen(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: makeStore("rl:api:"),
    message: { error: "Trop de requêtes, réessayez plus tard." },
  }),
);

// Limite stricte pour l'IA : 20 requêtes / min par IP
export const aiLimiter = failOpen(
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    store: makeStore("rl:ai:"),
    message: { error: "Trop de requêtes IA, patientez un instant." },
  }),
);
