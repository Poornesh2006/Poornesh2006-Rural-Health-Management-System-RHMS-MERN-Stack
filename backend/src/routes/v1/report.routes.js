import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  deleteSavedReport,
  exportReport,
  listReportTemplates,
  listSavedReports,
  previewReport,
  saveReport,
  updateSavedReport,
} from "../../controllers/report.controller.js";

export const reportRouter = Router();

reportRouter.use(requireAuth);
reportRouter.get("/preview", previewReport);
reportRouter.get("/export", exportReport);
reportRouter.get("/templates", listReportTemplates);
reportRouter.get("/saved", listSavedReports);
reportRouter.post("/saved", saveReport);
reportRouter.patch("/saved/:reportId", updateSavedReport);
reportRouter.delete("/saved/:reportId", deleteSavedReport);
