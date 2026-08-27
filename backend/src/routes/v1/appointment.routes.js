import { Router } from "express";
import {
  cancelAppointment,
  checkInAppointment,
  confirmAppointment,
  createAppointment,
  getAppointmentById,
  listAppointments,
  markMissedAppointment,
  rescheduleAppointment,
} from "../../controllers/appointment.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const appointmentRouter = Router();

appointmentRouter.use(requireAuth);
appointmentRouter.get("/", listAppointments);
appointmentRouter.post("/", createAppointment);
appointmentRouter.get("/:appointmentId", getAppointmentById);
appointmentRouter.post("/:appointmentId/confirm", confirmAppointment);
appointmentRouter.post("/:appointmentId/check-in", checkInAppointment);
appointmentRouter.post("/:appointmentId/cancel", cancelAppointment);
appointmentRouter.post("/:appointmentId/missed", markMissedAppointment);
appointmentRouter.post("/:appointmentId/reschedule", rescheduleAppointment);
