import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getProfile,
  listSessions,
  login,
  logout,
  refreshToken,
  revokeOtherSessions,
  revokeSession,
  resetPassword,
} from "../../controllers/auth.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/profile", requireAuth, getProfile);
authRouter.post("/change-password", requireAuth, changePassword);
authRouter.get("/sessions", requireAuth, listSessions);
authRouter.delete("/sessions/:sessionId", requireAuth, revokeSession);
authRouter.post("/sessions/revoke-others", requireAuth, revokeOtherSessions);
