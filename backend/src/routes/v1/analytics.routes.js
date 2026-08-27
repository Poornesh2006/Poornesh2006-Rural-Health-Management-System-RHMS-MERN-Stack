import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  getAppointmentAnalytics,
  getAuditAnalytics,
  getDataQualityAnalytics,
  getDiseaseTrendAnalytics,
  getDoctorAnalytics,
  getExecutiveSummary,
  getFollowUpAnalytics,
  getLaboratoryAnalytics,
  getPatientAnalytics,
  getPharmacyAnalytics,
  getQueueAnalytics,
  getVaccinationAnalytics,
  getVillageAnalytics,
} from "../../controllers/analytics.controller.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);
analyticsRouter.get("/executive", getExecutiveSummary);
analyticsRouter.get("/patients", getPatientAnalytics);
analyticsRouter.get("/appointments", getAppointmentAnalytics);
analyticsRouter.get("/queue", getQueueAnalytics);
analyticsRouter.get("/doctors", getDoctorAnalytics);
analyticsRouter.get("/pharmacy", getPharmacyAnalytics);
analyticsRouter.get("/laboratory", getLaboratoryAnalytics);
analyticsRouter.get("/vaccination", getVaccinationAnalytics);
analyticsRouter.get("/village-health", getVillageAnalytics);
analyticsRouter.get("/disease-trends", getDiseaseTrendAnalytics);
analyticsRouter.get("/follow-ups", getFollowUpAnalytics);
analyticsRouter.get("/data-quality", getDataQualityAnalytics);
analyticsRouter.get("/audit", getAuditAnalytics);
