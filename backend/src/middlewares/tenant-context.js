import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { tenantService } from "../services/tenant.service.js";

export async function tenantContextMiddleware(request, _response, next) {
  try {
    const authHeader = request.headers.authorization;
    let tokenUser = null;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        tokenUser = jwt.verify(authHeader.replace("Bearer ", ""), env.jwtSecret);
      } catch {
        tokenUser = null;
      }
    }

    request.tenant = await tenantService.resolveContext(tokenUser, request.headers["x-facility-id"]);
    next();
  } catch (error) {
    next(error);
  }
}
