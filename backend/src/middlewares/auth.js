import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(request, _response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    request.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    return next(error);
  }
}

export function requireRoles(...roles) {
  return function roleGuard(request, _response, next) {
    if (!request.user) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      return next(error);
    }

    if (!roles.includes(request.user.role)) {
      const error = new Error("Access denied");
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
}
