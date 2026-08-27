import { analyticsService } from "../services/analytics.service.js";
import { apiResponse } from "../utils/api-response.js";

function buildHandler(methodName, message) {
  return async function analyticsHandler(request, response, next) {
    try {
      const result = await analyticsService[methodName](request.query, request.user);
      response.json(apiResponse(message, result));
    } catch (error) {
      next(error);
    }
  };
}

export const getExecutiveSummary = buildHandler("getExecutiveSummary", "Executive dashboard fetched successfully");
export const getPatientAnalytics = buildHandler("getPatientAnalytics", "Patient analytics fetched successfully");
export const getAppointmentAnalytics = buildHandler("getAppointmentAnalytics", "Appointment analytics fetched successfully");
export const getQueueAnalytics = buildHandler("getQueueAnalytics", "Queue analytics fetched successfully");
export const getDoctorAnalytics = buildHandler("getDoctorAnalytics", "Doctor analytics fetched successfully");
export const getPharmacyAnalytics = buildHandler("getPharmacyAnalytics", "Pharmacy analytics fetched successfully");
export const getLaboratoryAnalytics = buildHandler("getLaboratoryAnalytics", "Laboratory analytics fetched successfully");
export const getVaccinationAnalytics = buildHandler("getVaccinationAnalytics", "Vaccination analytics fetched successfully");
export const getVillageAnalytics = buildHandler("getVillageAnalytics", "Village analytics fetched successfully");
export const getDiseaseTrendAnalytics = buildHandler("getDiseaseTrendAnalytics", "Disease trends fetched successfully");
export const getFollowUpAnalytics = buildHandler("getFollowUpAnalytics", "Follow-up analytics fetched successfully");
export const getDataQualityAnalytics = buildHandler("getDataQualityAnalytics", "Data quality analytics fetched successfully");
export const getAuditAnalytics = buildHandler("getAuditAnalytics", "Audit analytics fetched successfully");
