import { metricsService } from "../services/metrics.service.js";

export function metricsMiddleware(request, response, next) {
  response.on("finish", () => {
    metricsService.recordRequest({
      method: request.method,
      route: request.route?.path || request.path,
      statusCode: response.statusCode,
      durationMs: Date.now() - request.startedAt,
    });
  });

  next();
}
