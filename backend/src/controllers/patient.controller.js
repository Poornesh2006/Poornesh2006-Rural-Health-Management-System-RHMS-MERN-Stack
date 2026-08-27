import { patientService } from "../services/patient.service.js";
import { auditService } from "../services/audit.service.js";
import { apiResponse } from "../utils/api-response.js";
import { operationsService } from "../services/operations.service.js";

export async function listPatients(request, response, next) {
  try {
    const patients = await patientService.listPatients(request.query, request.tenant);
    response.json(apiResponse("Patients fetched successfully", patients));
  } catch (error) {
    next(error);
  }
}

export async function createPatient(request, response, next) {
  try {
    const patient = await patientService.createPatient(request.body, request.user, request.tenant);
    await auditService.record({
      actor: request.user,
      action: "patient_created",
      resourceType: "patient",
      resourceId: patient.patientId,
      ipAddress: request.ip,
    });
    response.status(201).json(apiResponse("Patient created successfully", patient));
  } catch (error) {
    next(error);
  }
}

export async function updatePatient(request, response, next) {
  try {
    const patient = await patientService.updatePatient(request.params.patientId, request.body, request.user, request.tenant);
    await auditService.record({
      actor: request.user,
      action: "patient_updated",
      resourceType: "patient",
      resourceId: patient.patientId,
      ipAddress: request.ip,
    });
    response.json(apiResponse("Patient updated successfully", patient));
  } catch (error) {
    next(error);
  }
}

export async function archivePatient(request, response, next) {
  try {
    const patient = await patientService.archivePatient(request.params.patientId, request.user, request.tenant);
    await auditService.record({
      actor: request.user,
      action: "patient_archived",
      resourceType: "patient",
      resourceId: patient.patientId,
      ipAddress: request.ip,
    });
    response.json(apiResponse("Patient archived successfully", patient));
  } catch (error) {
    next(error);
  }
}

export async function getPatientById(request, response, next) {
  try {
    const patient = await patientService.getPatientById(request.params.patientId, request.tenant);
    response.json(apiResponse("Patient fetched successfully", patient));
  } catch (error) {
    next(error);
  }
}

export async function getPatientClinicalProfile(request, response, next) {
  try {
    const profile = await patientService.getClinicalProfile(request.params.patientId, request.tenant);
    response.json(apiResponse("Patient clinical profile fetched successfully", profile));
  } catch (error) {
    next(error);
  }
}

export async function duplicatePatientCheck(request, response, next) {
  try {
    const matches = await operationsService.detectDuplicatePatients(request.body, request.tenant);
    await auditService.record({
      actor: request.user,
      action: "patient_duplicate_check",
      resourceType: "patient",
      resourceId: "duplicate-check",
      metadata: { matches: matches.length },
      ipAddress: request.ip,
    });
    response.json(apiResponse("Possible duplicate patients fetched successfully", matches));
  } catch (error) {
    next(error);
  }
}
