import { vaccinationService } from "../services/vaccination.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function createVaccine(request, response, next) {
  try {
    const result = await vaccinationService.createVaccine(request.body, request.user);
    response.status(201).json(apiResponse("Vaccine created successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listVaccines(request, response, next) {
  try {
    const result = await vaccinationService.listVaccines(request.query);
    response.json(apiResponse("Vaccines fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function updateVaccine(request, response, next) {
  try {
    const result = await vaccinationService.updateVaccine(request.params.vaccineId, request.body, request.user);
    response.json(apiResponse("Vaccine updated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function deactivateVaccine(request, response, next) {
  try {
    const result = await vaccinationService.deactivateVaccine(request.params.vaccineId, request.user);
    response.json(apiResponse("Vaccine deactivated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function receiveVaccineBatch(request, response, next) {
  try {
    const result = await vaccinationService.receiveBatch(request.body, request.user);
    response.status(201).json(apiResponse("Vaccine batch received successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listVaccineBatches(request, response, next) {
  try {
    const result = await vaccinationService.listBatches(request.query.vaccineId || "");
    response.json(apiResponse("Vaccine batches fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function createVaccinationSchedule(request, response, next) {
  try {
    const result = await vaccinationService.createSchedule(request.body, request.user);
    response.status(201).json(apiResponse("Vaccination schedule created successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listVaccinationSchedules(request, response, next) {
  try {
    const result = await vaccinationService.listSchedules(request.query);
    response.json(apiResponse("Vaccination schedules fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function administerVaccination(request, response, next) {
  try {
    const result = await vaccinationService.administerVaccination(request.body, request.user);
    response.status(201).json(apiResponse("Vaccination recorded successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getPatientVaccinations(request, response, next) {
  try {
    const result = await vaccinationService.getPatientVaccinations(request.params.patientId);
    response.json(apiResponse("Patient vaccinations fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getDueVaccines(request, response, next) {
  try {
    const result = await vaccinationService.getDueVaccines(request.params.patientId, request.query.overdue === "true");
    response.json(apiResponse("Due vaccines fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function recordAdverseEvent(request, response, next) {
  try {
    const result = await vaccinationService.recordAdverseEvent(request.params.recordId, request.body, request.user);
    response.json(apiResponse("Adverse event recorded successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getVaccinationCoverage(request, response, next) {
  try {
    const result = await vaccinationService.getCoverageStatistics();
    response.json(apiResponse("Vaccination coverage fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getVaccinationAlerts(request, response, next) {
  try {
    const result = await vaccinationService.getAlerts();
    response.json(apiResponse("Vaccination alerts fetched successfully", result));
  } catch (error) {
    next(error);
  }
}
