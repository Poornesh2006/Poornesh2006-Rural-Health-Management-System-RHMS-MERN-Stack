import { authService } from "../services/auth.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function login(request, response, next) {
  try {
    const result = await authService.login(request.body, {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });
    response.json(apiResponse("Login successful", result));
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(request, response, next) {
  try {
    const result = await authService.refreshAccessToken(request.body);
    response.json(apiResponse("Token refreshed successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function logout(request, response, next) {
  try {
    const result = await authService.logout(request.body);
    response.json(apiResponse("Logout successful", result));
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(request, response, next) {
  try {
    const result = await authService.forgotPassword(request.body);
    response.json(apiResponse("Password reset instructions generated", result));
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(request, response, next) {
  try {
    const result = await authService.resetPassword(request.body);
    response.json(apiResponse("Password reset successful", result));
  } catch (error) {
    next(error);
  }
}

export async function changePassword(request, response, next) {
  try {
    const result = await authService.changePassword(request.user.sub, request.body);
    response.json(apiResponse("Password changed successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getProfile(request, response, next) {
  try {
    const sessions = await authService.listSessions(request.user.sub);
    response.json(
      apiResponse("Profile fetched successfully", {
        user: {
          ...request.user,
          tenant: request.tenant,
          sessionsCount: sessions.length,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
}

export async function listSessions(request, response, next) {
  try {
    const result = await authService.listSessions(request.user.sub);
    response.json(apiResponse("Sessions fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function revokeSession(request, response, next) {
  try {
    const result = await authService.revokeSession(request.user.sub, request.params.sessionId);
    response.json(apiResponse("Session revoked successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function revokeOtherSessions(request, response, next) {
  try {
    const result = await authService.revokeOtherSessions(request.user.sub, request.user.sessionId);
    response.json(apiResponse("Other sessions revoked successfully", result));
  } catch (error) {
    next(error);
  }
}
