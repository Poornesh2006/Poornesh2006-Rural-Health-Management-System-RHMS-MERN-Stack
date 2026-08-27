import mongoose from "mongoose";
import { env } from "../config/env.js";
import { emailProviderService } from "./email-provider.service.js";
import { metricsService } from "./metrics.service.js";
import { smsProviderService } from "./sms-provider.service.js";

function getMongoStatus() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || "unknown";
}

export const healthService = {
  getLiveness() {
    return {
      status: "ok",
      service: "rhms-backend",
      timestamp: new Date().toISOString(),
    };
  },

  getReadiness() {
    const mongoStatus = getMongoStatus();
    return {
      status: mongoStatus === "connected" ? "ready" : "degraded",
      environment: env.nodeEnv,
      mongoStatus,
      metrics: metricsService.snapshot(),
    };
  },

  getDependencies() {
    return {
      mongo: {
        status: getMongoStatus(),
      },
      email: emailProviderService.getStatus(),
      sms: smsProviderService.getStatus(),
      storage: {
        configured: Boolean(env.backupStoragePath),
      },
      socket: {
        configured: true,
      },
    };
  },
};
