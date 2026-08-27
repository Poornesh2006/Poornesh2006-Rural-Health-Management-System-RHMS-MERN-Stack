import { Router } from "express";
import { getAvailableSlots, upsertDoctorSchedule } from "../../controllers/doctor-schedule.controller.js";
import { requireAuth, requireRoles } from "../../middlewares/auth.js";

export const doctorScheduleRouter = Router();

doctorScheduleRouter.get("/slots", requireAuth, getAvailableSlots);
doctorScheduleRouter.post("/", requireAuth, requireRoles("admin"), upsertDoctorSchedule);
