import crypto from "crypto";

export function createRequestId() {
  return crypto.randomUUID();
}

export function requestContextMiddleware(request, response, next) {
  request.id = request.headers["x-request-id"] || createRequestId();
  response.setHeader("x-request-id", request.id);
  request.startedAt = Date.now();
  next();
}
