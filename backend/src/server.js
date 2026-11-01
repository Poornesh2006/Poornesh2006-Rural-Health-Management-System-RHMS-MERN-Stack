import http from "http";
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { initializeSocket } from "./socket/socket-server.js";
import { notificationSchedulerService } from "./services/notification-scheduler.service.js";

async function bootstrap() {
  try {
    await mongoose.connect(env.mongoUri);
    const server = http.createServer(app);
    initializeSocket(server, env.corsOrigins);
    notificationSchedulerService.start();
    server.listen(env.port, "0.0.0.0", () => {
      logger.info({ port: env.port }, "RHMS API listening");
    });
    const shutdown = async (signal) => {
      logger.info({ signal }, "RHMS API shutting down");
      notificationSchedulerService.stop?.();
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error({ error }, "Failed to start RHMS API");
    process.exit(1);
  }
}

bootstrap();
