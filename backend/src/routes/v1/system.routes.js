import { Router } from "express";
import {
  createBackup,
  getSystemSettings,
  listBackups,
  requestRestore,
  updateSystemSettings,
} from "../../controllers/system.controller.js";
import { requireAuth, requireRoles } from "../../middlewares/auth.js";

export const systemRouter = Router();

systemRouter.use(requireAuth);
systemRouter.get("/settings", getSystemSettings);
systemRouter.put("/settings", requireRoles("admin"), updateSystemSettings);
systemRouter.get("/backups", requireRoles("admin"), listBackups);
systemRouter.post("/backups", requireRoles("admin"), createBackup);
systemRouter.post("/backups/:backupId/restore-request", requireRoles("admin"), requestRestore);
