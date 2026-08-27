import { reportService } from "../services/report.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function previewReport(request, response, next) {
  try {
    const result = await reportService.previewReport(request.query, request.user);
    response.json(apiResponse("Report preview fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function exportReport(request, response, next) {
  try {
    const result = await reportService.exportReport(request.query, request.user);
    response.setHeader("Content-Type", result.contentType);
    response.setHeader("Content-Disposition", `attachment; filename=\"${result.filename}\"`);
    response.send(result.buffer);
  } catch (error) {
    next(error);
  }
}

export async function saveReport(request, response, next) {
  try {
    const result = await reportService.saveReport(request.body, request.user);
    response.status(201).json(apiResponse("Report preset saved successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listSavedReports(request, response, next) {
  try {
    const result = await reportService.listSavedReports(request.user);
    response.json(apiResponse("Saved reports fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function updateSavedReport(request, response, next) {
  try {
    const result = await reportService.updateSavedReport(request.params.reportId, request.body, request.user);
    response.json(apiResponse("Saved report updated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function deleteSavedReport(request, response, next) {
  try {
    const result = await reportService.deleteSavedReport(request.params.reportId, request.user);
    response.json(apiResponse("Saved report deleted successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listReportTemplates(_request, response, next) {
  try {
    const result = reportService.listTemplates();
    response.json(apiResponse("Report templates fetched successfully", result));
  } catch (error) {
    next(error);
  }
}
