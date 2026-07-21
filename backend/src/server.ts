import { prisma } from "@viewbeforebuy/database";
import { createApp } from "./app.js";

const port = Number(process.env.PORT || 4000);
const app = createApp();

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
