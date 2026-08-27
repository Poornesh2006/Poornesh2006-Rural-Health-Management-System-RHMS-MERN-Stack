import { Router } from "express";
import {
  archivePatient,
  createPatient,
  duplicatePatientCheck,
  getPatientClinicalProfile,
  getPatientById,
  listPatients,
  updatePatient,
} from "../../controllers/patient.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const patientRouter = Router();

patientRouter.use(requireAuth);
patientRouter.get("/", listPatients);
patientRouter.post("/duplicate-check", duplicatePatientCheck);
patientRouter.post("/", createPatient);
patientRouter.patch("/:patientId", updatePatient);
patientRouter.post("/:patientId/archive", archivePatient);
patientRouter.get("/:patientId/clinical-profile", getPatientClinicalProfile);
patientRouter.get("/:patientId", getPatientById);
