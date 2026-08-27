import { Router } from "express";
import { createVisit, listPatientVisits } from "../../controllers/visit.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const visitRouter = Router();

visitRouter.use(requireAuth);
visitRouter.post("/", createVisit);
visitRouter.get("/patient/:patientId", listPatientVisits);
