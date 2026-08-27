import { Router } from "express";
import {
  createConsent,
  createOutreachCamp,
  createReferral,
  detectDuplicates,
  downloadReferralPdf,
  exportFhirBundle,
  generateAiSummary,
  getAiGovernance,
  getIntegrationStatus,
  listConsents,
  listDevices,
  listOutreachCamps,
  listPlatformContext,
  listReferrals,
  registerDevice,
  revokeConsent,
  revokeDevice,
  reviewAiOutput,
  switchFacility,
  updateReferralStatus,
} from "../../controllers/platform.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const platformRouter = Router();

platformRouter.use(requireAuth);
platformRouter.get("/context", listPlatformContext);
platformRouter.post("/switch-facility", switchFacility);
platformRouter.get("/consents", listConsents);
platformRouter.post("/consents", createConsent);
platformRouter.post("/consents/:consentId/revoke", revokeConsent);
platformRouter.get("/referrals", listReferrals);
platformRouter.post("/referrals", createReferral);
platformRouter.post("/referrals/:referralId/status", updateReferralStatus);
platformRouter.get("/referrals/:referralId/pdf", downloadReferralPdf);
platformRouter.get("/fhir/export", exportFhirBundle);
platformRouter.get("/integrations", getIntegrationStatus);
platformRouter.post("/ai/visit-summary", generateAiSummary);
platformRouter.get("/ai/duplicates", detectDuplicates);
platformRouter.post("/ai/reviews/:auditId", reviewAiOutput);
platformRouter.get("/ai/governance", getAiGovernance);
platformRouter.get("/devices", listDevices);
platformRouter.post("/devices", registerDevice);
platformRouter.post("/devices/:deviceId/revoke", revokeDevice);
platformRouter.get("/outreach-camps", listOutreachCamps);
platformRouter.post("/outreach-camps", createOutreachCamp);
