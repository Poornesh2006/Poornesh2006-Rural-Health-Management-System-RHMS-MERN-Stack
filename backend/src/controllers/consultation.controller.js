import { consultationService } from "../services/consultation.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function startConsultation(request, response, next) {
  try {
    const queueEntry = await consultationService.startConsultation(request.body, request.user);
    response.json(apiResponse("Consultation started successfully", queueEntry));
  } catch (error) {
    next(error);
  }
}

export async function completeConsultation(request, response, next) {
  try {
    const result = await consultationService.completeConsultation(request.body, request.user);
    response.json(apiResponse("Consultation completed successfully", result));
  } catch (error) {
    next(error);
  }
}
