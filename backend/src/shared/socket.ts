import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.debug(`Socket connecté: ${socket.id}`);

    socket.on("user:join", (userId: string) => {
      if (typeof userId === "string" && userId.length > 0) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on("conversation:join", (conversationId: string) => {
      if (typeof conversationId === "string" && conversationId.length > 0) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("conversation:leave", (conversationId: string) => {
      if (typeof conversationId === "string" && conversationId.length > 0) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on("disconnect", () => {
      logger.debug(`Socket déconnecté: ${socket.id}`);
    });
  });

  logger.info("Socket.io initialisé");
  return io;
}

export function getIO(): Server | null {
  return io;
}

/** Diffuse un nouveau message à tous les clients d'une conversation. */
export function emitNewMessage(conversationId: string, message: unknown): void {
  io?.to(`conversation:${conversationId}`).emit("message:new", { conversationId, message });
}

/** Diffuse une notification à l'utilisateur ciblé. */
export function emitNotification(userId: string, notification: unknown): void {
  io?.to(`user:${userId}`).emit("notification:new", notification);
}
