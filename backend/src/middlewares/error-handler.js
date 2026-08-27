import { ZodError } from "zod";
import { logger } from "../config/logger.js";

export function errorHandler(error, request, response, _next) {
  if (error instanceof ZodError) {
    logger.warn({ requestId: request.id, issues: error.issues }, "Validation failed");
    return response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error?.code === 11000) {
    logger.warn({ requestId: request.id, keyPattern: error.keyPattern }, "Duplicate key error");
    return response.status(409).json({
      success: false,
      message: "A record with this value already exists",
      errors: Object.keys(error.keyPattern || {}).map((field) => ({
        field,
        message: `${field} must be unique`,
      })),
    });
  }

  logger.error({
    requestId: request.id,
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,
  }, "Unhandled application error");

  return response.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
}
