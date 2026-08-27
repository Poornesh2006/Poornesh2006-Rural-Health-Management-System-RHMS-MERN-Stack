import { apiResponse } from "../utils/api-response.js";
import { auditService } from "../services/audit.service.js";
import { householdService } from "../services/household.service.js";
import { operationsService } from "../services/operations.service.js";

export async function listHouseholds(request, response, next) {
  try {
    const items = await householdService.listHouseholds(request.tenant);
    response.json(apiResponse("Households fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function createHousehold(request, response, next) {
  try {
    const item = await householdService.createHousehold(request.body, request.user, request.tenant);
    await auditService.record({ actor: request.user, action: "household_created", resourceType: "household", resourceId: item.householdId, ipAddress: request.ip });
    response.status(201).json(apiResponse("Household created successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function getHouseholdById(request, response, next) {
  try {
    const item = await householdService.getHouseholdById(request.params.householdId, request.tenant);
    response.json(apiResponse("Household fetched successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function duplicatePatientCheck(request, response, next) {
  try {
    const items = await operationsService.detectDuplicatePatients(request.body, request.tenant);
    await auditService.record({ actor: request.user, action: "patient_duplicate_check", resourceType: "patient", resourceId: "duplicate-check", metadata: { matches: items.length }, ipAddress: request.ip });
    response.json(apiResponse("Duplicate patient check completed", items));
  } catch (error) {
    next(error);
  }
}

export async function listFollowUpTasks(request, response, next) {
  try {
    const items = await operationsService.listFollowUpTasks(request.tenant);
    response.json(apiResponse("Follow-up tasks fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function createFollowUpTask(request, response, next) {
  try {
    const item = await operationsService.createFollowUpTask(request.body, request.user, request.tenant);
    response.status(201).json(apiResponse("Follow-up task created successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function updateFollowUpTask(request, response, next) {
  try {
    const item = await operationsService.updateFollowUpTask(request.params.taskNumber, request.body, request.user, request.tenant);
    response.json(apiResponse("Follow-up task updated successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function listShiftHandovers(request, response, next) {
  try {
    const items = await operationsService.listShiftHandovers(request.tenant);
    response.json(apiResponse("Shift handovers fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function createShiftHandover(request, response, next) {
  try {
    const item = await operationsService.createShiftHandover(request.body, request.user, request.tenant);
    response.status(201).json(apiResponse("Shift handover created successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function updateShiftHandover(request, response, next) {
  try {
    const item = await operationsService.updateShiftHandover(request.params.handoverNumber, request.body, request.user, request.tenant);
    response.json(apiResponse("Shift handover updated successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function listAlerts(request, response, next) {
  try {
    const items = await operationsService.listAlerts(request.tenant);
    response.json(apiResponse("Alerts fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function createAlert(request, response, next) {
  try {
    const item = await operationsService.createAlert(request.body, request.user, request.tenant);
    response.status(201).json(apiResponse("Alert created successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function updateAlert(request, response, next) {
  try {
    const item = await operationsService.updateAlert(request.params.alertNumber, request.body.status, request.user, request.tenant);
    response.json(apiResponse("Alert updated successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function getDataQualitySummary(request, response, next) {
  try {
    const items = await operationsService.getDataQualitySummary(request.tenant);
    response.json(apiResponse("Data quality summary fetched successfully", items));
  } catch (error) {
    next(error);
  }
}

export async function createDocumentVerification(request, response, next) {
  try {
    const item = await operationsService.createDocumentVerification(request.body, request.user, request.tenant);
    response.status(201).json(apiResponse("Document verification created successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function verifyDocument(request, response, next) {
  try {
    const item = await operationsService.verifyDocument(request.params.publicToken);
    response.json(apiResponse("Document verification fetched successfully", item));
  } catch (error) {
    next(error);
  }
}

export async function globalSearch(request, response, next) {
  try {
    const item = await operationsService.globalSearch(request.query, request.tenant);
    response.json(apiResponse("Global search completed successfully", item));
  } catch (error) {
    next(error);
  }
}
