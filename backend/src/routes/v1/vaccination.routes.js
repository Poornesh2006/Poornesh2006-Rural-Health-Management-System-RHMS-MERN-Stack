import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  administerVaccination,
  createVaccinationSchedule,
  createVaccine,
  deactivateVaccine,
  getDueVaccines,
  getPatientVaccinations,
  getVaccinationAlerts,
  getVaccinationCoverage,
  listVaccineBatches,
  listVaccinationSchedules,
  listVaccines,
  receiveVaccineBatch,
  recordAdverseEvent,
  updateVaccine,
} from "../../controllers/vaccination.controller.js";

export const vaccinationRouter = Router();

vaccinationRouter.use(requireAuth);
vaccinationRouter.get("/vaccines", listVaccines);
vaccinationRouter.post("/vaccines", createVaccine);
vaccinationRouter.patch("/vaccines/:vaccineId", updateVaccine);
vaccinationRouter.post("/vaccines/:vaccineId/deactivate", deactivateVaccine);
vaccinationRouter.post("/batches/receive", receiveVaccineBatch);
vaccinationRouter.get("/batches", listVaccineBatches);
vaccinationRouter.get("/schedules", listVaccinationSchedules);
vaccinationRouter.post("/schedules", createVaccinationSchedule);
vaccinationRouter.post("/administer", administerVaccination);
vaccinationRouter.get("/patients/:patientId", getPatientVaccinations);
vaccinationRouter.get("/patients/:patientId/due", getDueVaccines);
vaccinationRouter.post("/records/:recordId/adverse-event", recordAdverseEvent);
vaccinationRouter.get("/coverage", getVaccinationCoverage);
vaccinationRouter.get("/alerts", getVaccinationAlerts);
