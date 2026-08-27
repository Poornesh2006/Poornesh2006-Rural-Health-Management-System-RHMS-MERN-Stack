import { apiResponse } from "../utils/api-response.js";
import { aiService } from "../services/ai.service.js";
import { consentService } from "../services/consent.service.js";
import { deviceService } from "../services/device.service.js";
import { featureFlagService } from "../services/feature-flag.service.js";
import { fhirService } from "../services/fhir.service.js";
import { IntegrationConnection } from "../models/integration-connection.model.js";
import { outreachService } from "../services/outreach.service.js";
import { referralService } from "../services/referral.service.js";
import { tenantService } from "../services/tenant.service.js";

export async function listPlatformContext(request, response, next) {
  try {
    const data = await tenantService.listOrganizationsAndFacilities();
    const allowedFacilities = await tenantService.listFacilitiesForUser(request.user.sub);
    const featureFlags = await featureFlagService.listFlags();
    response.json(apiResponse("Platform context fetched successfully", {
      ...data,
      allowedFacilities,
      activeFacilityId: request.tenant.facilityId,
      featureFlags,
    }));
  } catch (error) {
    next(error);
  }
}

export async function switchFacility(request, response, next) {
  try {
    const user = await tenantService.switchFacility(request.user.sub, request.body.facilityId);
    response.json(apiResponse("Facility switched successfully", user));
  } catch (error) {
    next(error);
  }
}

export async function listConsents(request, response, next) {
  try {
    const items = await consentService.listConsents(request.tenant);
    response.json(apiResponse("Consents fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function createConsent(request, response, next) {
  try {
    const item = await consentService.createConsent(request.body, request.user, request.tenant);
    response.status(201).json(apiResponse("Consent created successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function revokeConsent(request, response, next) {
  try {
    const item = await consentService.revokeConsent(request.params.consentId, request.user);
    response.json(apiResponse("Consent revoked successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function listReferrals(request, response, next) {
  try {
    const items = await referralService.listReferrals(request.tenant);
    response.json(apiResponse("Referrals fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function createReferral(request, response, next) {
  try {
    const item = await referralService.createReferral(request.body, request.user, request.tenant);
    response.status(201).json(apiResponse("Referral created successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function updateReferralStatus(request, response, next) {
  try {
    const item = await referralService.updateStatus(request.params.referralId, request.body, request.user);
    response.json(apiResponse("Referral updated successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function downloadReferralPdf(request, response, next) {
  try {
    const pdfBuffer = await referralService.generatePdf(request.params.referralId);
    response.setHeader("content-type", "application/pdf");
    response.setHeader("content-disposition", `attachment; filename="${request.params.referralId}.pdf"`);
    response.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

export async function exportFhirBundle(request, response, next) {
  try {
    const bundle = await fhirService.exportBundle({
      patientId: request.query.patientId,
      resourceTypes: request.query.resourceTypes ? String(request.query.resourceTypes).split(",") : [],
    });
    response.json(apiResponse("FHIR bundle exported successfully", bundle));
  } catch (error) {
    next(error);
  }
}

export async function getIntegrationStatus(_request, response, next) {
  try {
    const items = await IntegrationConnection.find().sort({ provider: 1 }).lean();
    response.json(apiResponse("Integration status fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function generateAiSummary(request, response, next) {
  try {
    const item = await aiService.generateVisitHistorySummary({
      patientId: request.body.patientId,
      actor: request.user,
      tenant: request.tenant,
    });
    response.json(apiResponse("AI summary generated successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function detectDuplicates(request, response, next) {
  try {
    const item = await aiService.detectPotentialDuplicates({ actor: request.user });
    response.json(apiResponse("Duplicate analysis generated successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function reviewAiOutput(request, response, next) {
  try {
    const item = await aiService.reviewAudit(request.params.auditId, request.body);
    response.json(apiResponse("AI output review recorded successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function getAiGovernance(_request, response, next) {
  try {
    const item = await aiService.listGovernanceSummary();
    response.json(apiResponse("AI governance data fetched successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function listDevices(request, response, next) {
  try {
    const items = await deviceService.listDevices(request.tenant);
    response.json(apiResponse("Devices fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function registerDevice(request, response, next) {
  try {
    const item = await deviceService.registerDevice(request.body, request.user, request.tenant);
    response.status(201).json(apiResponse("Device registered successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function revokeDevice(request, response, next) {
  try {
    const item = await deviceService.revokeDevice(request.params.deviceId);
    response.json(apiResponse("Device revoked successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function listOutreachCamps(request, response, next) {
  try {
    const items = await outreachService.listCamps(request.tenant);
    response.json(apiResponse("Outreach camps fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function createOutreachCamp(request, response, next) {
  try {
    const item = await outreachService.createCamp(request.body, request.user, request.tenant);
    response.status(201).json(apiResponse("Outreach camp created successfully", item));
  } catch (error) {
    next(error);
  }
}
