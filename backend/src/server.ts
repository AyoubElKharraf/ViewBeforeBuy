import { createServer } from "node:http";
import { prisma } from "@viewbeforebuy/database";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./shared/logger.js";
import { redis } from "./shared/redis.js";
import { initSocket } from "./shared/socket.js";

const app = createApp();
const httpServer = createServer(app);
initSocket(httpServer);

const server = httpServer.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    if (redis) await redis.quit().catch(() => undefined);
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

// Filet de sécurité : ne pas crasher sur un rejet non géré (ex. Redis indisponible)
process.on("unhandledRejection", (reason) => {
  logger.warn(`Rejet de promesse non géré: ${String(reason)}`);
});
