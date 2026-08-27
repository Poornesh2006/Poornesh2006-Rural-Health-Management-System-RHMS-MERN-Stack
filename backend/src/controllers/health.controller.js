import { healthService } from "../services/health.service.js";

export function getLiveness(_request, response) {
  response.json({
    success: true,
    message: "Service is live",
    data: healthService.getLiveness(),
  });
}

export function getReadiness(_request, response) {
  const readiness = healthService.getReadiness();
  response.status(readiness.status === "ready" ? 200 : 503).json({
    success: readiness.status === "ready",
    message: "Service readiness status",
    data: readiness,
  });
}

export function getDependencies(_request, response) {
  response.json({
    success: true,
    message: "Dependency status fetched successfully",
    data: healthService.getDependencies(),
  });
}
