import { dashboardService } from "../services/dashboard.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function getDashboardSummary(_request, response, next) {
  try {
    const summary = await dashboardService.getSummary();
    response.json(apiResponse("Dashboard summary fetched successfully", summary));
  } catch (error) {
    next(error);
  }
}
