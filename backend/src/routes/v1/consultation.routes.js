import { Router } from "express";
import { completeConsultation, startConsultation } from "../../controllers/consultation.controller.js";
import { requireAuth, requireRoles } from "../../middlewares/auth.js";

export const consultationRouter = Router();

consultationRouter.use(requireAuth, requireRoles("admin", "doctor"));
consultationRouter.post("/start", startConsultation);
consultationRouter.post("/complete", completeConsultation);
