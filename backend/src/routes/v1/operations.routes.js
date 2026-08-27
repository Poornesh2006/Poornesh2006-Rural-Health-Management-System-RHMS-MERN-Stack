import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  createAlert,
  createDocumentVerification,
  createFollowUpTask,
  createHousehold,
  createShiftHandover,
  getDataQualitySummary,
  getHouseholdById,
  globalSearch,
  listAlerts,
  listFollowUpTasks,
  listHouseholds,
  listShiftHandovers,
  updateAlert,
  updateFollowUpTask,
  updateShiftHandover,
  verifyDocument,
} from "../../controllers/operations.controller.js";

export const operationsRouter = Router();

operationsRouter.get("/verify/:publicToken", verifyDocument);
operationsRouter.use(requireAuth);
operationsRouter.get("/households", listHouseholds);
operationsRouter.post("/households", createHousehold);
operationsRouter.get("/households/:householdId", getHouseholdById);
operationsRouter.get("/follow-up-tasks", listFollowUpTasks);
operationsRouter.post("/follow-up-tasks", createFollowUpTask);
operationsRouter.patch("/follow-up-tasks/:taskNumber", updateFollowUpTask);
operationsRouter.get("/shift-handovers", listShiftHandovers);
operationsRouter.post("/shift-handovers", createShiftHandover);
operationsRouter.patch("/shift-handovers/:handoverNumber", updateShiftHandover);
operationsRouter.get("/alerts", listAlerts);
operationsRouter.post("/alerts", createAlert);
operationsRouter.patch("/alerts/:alertNumber", updateAlert);
operationsRouter.get("/data-quality", getDataQualitySummary);
operationsRouter.post("/document-verifications", createDocumentVerification);
operationsRouter.get("/search", globalSearch);
