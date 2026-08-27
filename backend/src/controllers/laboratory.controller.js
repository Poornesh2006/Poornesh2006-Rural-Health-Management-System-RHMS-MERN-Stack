import { laboratoryService } from "../services/laboratory.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function createLabTest(request, response, next) {
  try {
    const result = await laboratoryService.createTest(request.body, request.user);
    response.status(201).json(apiResponse("Lab test created successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listLabTests(request, response, next) {
  try {
    const result = await laboratoryService.listTests(request.query);
    response.json(apiResponse("Lab tests fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function updateLabTest(request, response, next) {
  try {
    const result = await laboratoryService.updateTest(request.params.testId, request.body, request.user);
    response.json(apiResponse("Lab test updated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function deactivateLabTest(request, response, next) {
  try {
    const result = await laboratoryService.deactivateTest(request.params.testId, request.user);
    response.json(apiResponse("Lab test deactivated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listLabRequests(request, response, next) {
  try {
    const result = await laboratoryService.listRequests(request.query);
    response.json(apiResponse("Lab requests fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getLabRequestById(request, response, next) {
  try {
    const result = await laboratoryService.getRequestById(request.params.requestId);
    response.json(apiResponse("Lab request fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function acknowledgeLabRequest(request, response, next) {
  try {
    const result = await laboratoryService.acknowledgeRequest(request.params.requestId, request.user);
    response.json(apiResponse("Lab request acknowledged successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function collectLabSample(request, response, next) {
  try {
    const result = await laboratoryService.collectSample(request.params.requestId, request.body, request.user);
    response.json(apiResponse("Sample collected successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function requestLabRecollection(request, response, next) {
  try {
    const result = await laboratoryService.requestRecollection(request.params.requestId, request.body, request.user);
    response.json(apiResponse("Recollection requested successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function startLabProcessing(request, response, next) {
  try {
    const result = await laboratoryService.startProcessing(request.params.requestId, request.user);
    response.json(apiResponse("Lab processing started successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function enterLabResult(request, response, next) {
  try {
    const result = await laboratoryService.enterResult(request.params.requestId, request.body, request.user);
    response.json(apiResponse("Lab result entered successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function verifyLabResult(request, response, next) {
  try {
    const result = await laboratoryService.verifyResult(request.params.requestId, request.user);
    response.json(apiResponse("Lab result verified successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function doctorReviewLabResult(request, response, next) {
  try {
    const result = await laboratoryService.doctorReviewResult(request.params.requestId, request.body, request.user);
    response.json(apiResponse("Lab result reviewed successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getPatientLabHistory(request, response, next) {
  try {
    const result = await laboratoryService.getPatientLabHistory(request.params.patientId);
    response.json(apiResponse("Patient lab history fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getLaboratoryDailyStats(request, response, next) {
  try {
    const result = await laboratoryService.getDailyStatistics();
    response.json(apiResponse("Laboratory statistics fetched successfully", result));
  } catch (error) {
    next(error);
  }
}
