import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const isRedisEnabled = Boolean(env.REDIS_URL);

export const redis: Redis | null = isRedisEnabled
  ? new Redis(env.REDIS_URL, {
      // File d'attente activée : les commandes patientent le temps de la connexion.
      // Le cache est de toute façon protégé par `redisReady`.
      enableOfflineQueue: true,
      maxRetriesPerRequest: 2,
      lazyConnect: false,
      retryStrategy: (times: number) => (times > 10 ? null : Math.min(times * 300, 3000)),
    })
  : null;

let redisReady = false;
let warnedDown = false;

if (redis) {
  redis.on("ready", () => {
    redisReady = true;
    warnedDown = false;
    logger.info("Redis connecté");
  });
  redis.on("error", (err: Error) => {
    if (!warnedDown) {
      logger.warn(`Redis indisponible (dégradation gracieuse activée): ${err.message}`);
      warnedDown = true;
    }
  });
  redis.on("end", () => {
    redisReady = false;
  });
}

export function isRedisReady(): boolean {
  return redisReady;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis || !redisReady) return null;
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  if (!redis || !redisReady) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    /* ignore */
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  if (!redis || !redisReady) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {
    /* ignore */
  }
}

/** Récupère depuis le cache, sinon exécute `loader`, met en cache et renvoie. */
export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await loader();
  await cacheSet(key, value, ttlSeconds);
  return value;
}
