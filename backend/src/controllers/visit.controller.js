import { visitService } from "../services/visit.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function createVisit(request, response, next) {
  try {
    const visit = await visitService.createVisit(request.body, request.user);
    response.status(201).json(apiResponse("Visit created successfully", visit));
  } catch (error) {
    next(error);
  }
}

export async function listPatientVisits(request, response, next) {
  try {
    const visits = await visitService.listPatientVisits(request.params.patientId);
    response.json(apiResponse("Visits fetched successfully", visits));
  } catch (error) {
    next(error);
  }
}
