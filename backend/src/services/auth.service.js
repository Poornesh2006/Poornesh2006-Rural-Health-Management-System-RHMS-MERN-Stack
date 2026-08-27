import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRequestId } from "../utils/request-context.js";
import { User } from "../models/user.model.js";
import { userRepository } from "../repositories/user.repository.js";
import { env } from "../config/env.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { createRandomToken, createSha256Hash } from "../utils/security.js";

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const source = user.toObject ? user.toObject() : user;
  const { passwordHash, refreshTokens, resetPasswordTokenHash, ...safeUser } = source;
  return safeUser;
}

function buildAccessToken(user) {
  const sessionId = user.__sessionId || "";
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      sessionId,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function buildRefreshToken(user) {
  const sessionId = user.__sessionId || "";
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      tokenId: createRandomToken(),
      sessionId,
    },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn },
  );
}

export const authService = {
  async login(payload, context = {}) {
    const parsedPayload = loginSchema.parse(payload);
    const user = await userRepository.findByEmail(parsedPayload.email);

    if (!user || !user.isActive) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(parsedPayload.password, user.passwordHash);

    if (!isPasswordCorrect) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const sessionId = createRequestId();
    user.__sessionId = sessionId;
    const accessToken = buildAccessToken(user);
    const refreshToken = buildRefreshToken(user);
    const decodedRefresh = jwt.verify(refreshToken, env.jwtRefreshSecret);

    user.refreshTokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
    user.loginHistory = Array.isArray(user.loginHistory) ? user.loginHistory : [];
    user.activeSessions = Array.isArray(user.activeSessions) ? user.activeSessions : [];
    user.refreshTokens.push({
      token: decodedRefresh.tokenId,
      sessionId,
      expiresAt: new Date(decodedRefresh.exp * 1000),
    });
    user.activeSessions.push({
      sessionId,
      refreshTokenId: decodedRefresh.tokenId,
      ipAddress: context.ipAddress || "",
      userAgent: context.userAgent || "",
      deviceName: context.userAgent ? context.userAgent.split(" ").slice(0, 3).join(" ") : "Unknown device",
      lastActiveAt: new Date(),
    });
    user.loginHistory.unshift({
      ipAddress: context.ipAddress || "",
      userAgent: context.userAgent || "",
    });
    user.loginHistory = user.loginHistory.slice(0, 10);
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  },

  async refreshAccessToken(payload) {
    const parsedPayload = refreshSchema.parse(payload);
    let decoded;

    try {
      decoded = jwt.verify(parsedPayload.refreshToken, env.jwtRefreshSecret);
    } catch {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    const user = await userRepository.findById(decoded.sub);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const tokenExists = user.refreshTokens.some((tokenEntry) => tokenEntry.token === decoded.tokenId);

    if (!tokenExists) {
      const error = new Error("Refresh token is no longer valid");
      error.statusCode = 401;
      throw error;
    }

    user.activeSessions = Array.isArray(user.activeSessions) ? user.activeSessions : [];
    user.activeSessions = user.activeSessions.map((session) =>
      session.sessionId === decoded.sessionId
        ? {
            ...session,
            lastActiveAt: new Date(),
          }
        : session,
    );
    await user.save();

    return {
      accessToken: buildAccessToken(user),
      user: sanitizeUser(user),
    };
  },

  async logout(payload) {
    const parsedPayload = refreshSchema.parse(payload);
    const decoded = jwt.verify(parsedPayload.refreshToken, env.jwtRefreshSecret);
    const user = await userRepository.findById(decoded.sub);

    if (user) {
      user.refreshTokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
      user.activeSessions = Array.isArray(user.activeSessions) ? user.activeSessions : [];
      user.refreshTokens = user.refreshTokens.filter((tokenEntry) => tokenEntry.token !== decoded.tokenId);
      user.activeSessions = user.activeSessions.map((session) =>
        session.sessionId === decoded.sessionId
          ? {
              ...session,
              revokedAt: new Date(),
            }
          : session,
      );
      await user.save();
    }

    return { success: true };
  },

  async forgotPassword(payload) {
    const parsedPayload = forgotPasswordSchema.parse(payload);
    const user = await userRepository.findByEmail(parsedPayload.email);

    if (!user) {
      return { success: true };
    }

    const resetToken = createRandomToken();
    user.resetPasswordTokenHash = createSha256Hash(resetToken);
    user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    return {
      success: true,
      ...(env.nodeEnv === "development" ? { debugResetToken: resetToken } : {}),
    };
  },

  async resetPassword(payload) {
    const parsedPayload = resetPasswordSchema.parse(payload);
    const tokenHash = createSha256Hash(parsedPayload.token);
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      const error = new Error("Reset token is invalid or expired");
      error.statusCode = 400;
      throw error;
    }

    user.passwordHash = await bcrypt.hash(parsedPayload.password, 12);
    user.resetPasswordTokenHash = "";
    user.resetPasswordExpiresAt = null;
    user.refreshTokens = [];
    user.activeSessions = [];
    await user.save();

    return { success: true };
  },

  async changePassword(userId, payload) {
    const parsedPayload = changePasswordSchema.parse(payload);
    const user = await userRepository.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(parsedPayload.currentPassword, user.passwordHash);

    if (!isPasswordCorrect) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      throw error;
    }

    user.passwordHash = await bcrypt.hash(parsedPayload.newPassword, 12);
    await user.save();

    return { success: true };
  },

  async listSessions(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return (user.activeSessions || []).sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt));
  },

  async revokeSession(userId, sessionId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    user.refreshTokens = (user.refreshTokens || []).filter((token) => token.sessionId !== sessionId);
    user.activeSessions = (user.activeSessions || []).map((session) =>
      session.sessionId === sessionId
        ? {
            ...session,
            revokedAt: new Date(),
          }
        : session,
    );
    await user.save();

    return { success: true };
  },

  async revokeOtherSessions(userId, currentSessionId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    user.refreshTokens = (user.refreshTokens || []).filter((token) => token.sessionId === currentSessionId);
    user.activeSessions = (user.activeSessions || []).map((session) =>
      session.sessionId !== currentSessionId
        ? {
            ...session,
            revokedAt: new Date(),
          }
        : session,
    );
    await user.save();

    return { success: true };
  },

  sanitizeUser,
};
