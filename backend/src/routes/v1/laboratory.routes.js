import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  acknowledgeLabRequest,
  collectLabSample,
  createLabTest,
  deactivateLabTest,
  doctorReviewLabResult,
  enterLabResult,
  getLaboratoryDailyStats,
  getLabRequestById,
  getPatientLabHistory,
  listLabRequests,
  listLabTests,
  requestLabRecollection,
  startLabProcessing,
  updateLabTest,
  verifyLabResult,
} from "../../controllers/laboratory.controller.js";

export const laboratoryRouter = Router();

laboratoryRouter.use(requireAuth);
laboratoryRouter.get("/tests", listLabTests);
laboratoryRouter.post("/tests", createLabTest);
laboratoryRouter.patch("/tests/:testId", updateLabTest);
laboratoryRouter.post("/tests/:testId/deactivate", deactivateLabTest);
laboratoryRouter.get("/requests", listLabRequests);
laboratoryRouter.get("/requests/:requestId", getLabRequestById);
laboratoryRouter.post("/requests/:requestId/acknowledge", acknowledgeLabRequest);
laboratoryRouter.post("/requests/:requestId/collect-sample", collectLabSample);
laboratoryRouter.post("/requests/:requestId/recollection", requestLabRecollection);
laboratoryRouter.post("/requests/:requestId/start-processing", startLabProcessing);
laboratoryRouter.post("/requests/:requestId/enter-result", enterLabResult);
laboratoryRouter.post("/requests/:requestId/verify", verifyLabResult);
laboratoryRouter.post("/requests/:requestId/doctor-review", doctorReviewLabResult);
laboratoryRouter.get("/patients/:patientId/history", getPatientLabHistory);
laboratoryRouter.get("/stats/daily", getLaboratoryDailyStats);
