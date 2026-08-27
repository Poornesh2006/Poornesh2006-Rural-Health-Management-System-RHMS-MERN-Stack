import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { getDependencies, getLiveness, getReadiness } from "./controllers/health.controller.js";
import { logger } from "./config/logger.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { metricsMiddleware } from "./middlewares/metrics.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { env } from "./config/env.js";
import { requestContextMiddleware } from "./utils/request-context.js";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: env.nodeEnv === "production"
      ? undefined
      : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(requestContextMiddleware);
app.use(
  pinoHttp({
    logger,
    customProps(request, response) {
      return {
        requestId: request.id,
        statusCode: response.statusCode,
      };
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(metricsMiddleware);

app.get("/health", getLiveness);
app.get("/health/live", getLiveness);
app.get("/health/ready", getReadiness);
app.get("/health/dependencies", getDependencies);

app.use("/api/v1", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
