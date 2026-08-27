import { z } from "zod";

export const appointmentStatusValues = [
  "scheduled",
  "confirmed",
  "checked_in",
  "waiting",
  "called",
  "in_consultation",
  "completed",
  "cancelled",
  "missed",
  "rescheduled",
];

export const appointmentPriorityValues = [
  "normal",
  "senior_citizen",
  "pregnant",
  "child",
  "disability",
  "emergency",
];

export const bookingSourceValues = [
  "reception",
  "doctor",
  "health_worker",
  "follow_up",
  "online",
  "walk_in",
];

export const createAppointmentSchema = z.object({
  patientId: z.string().min(5),
  doctorId: z.string().optional().or(z.literal("")),
  doctorName: z.string().min(2).optional().or(z.literal("")),
  department: z.string().min(2),
  appointmentDate: z.string().min(10),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  appointmentType: z.string().min(2),
  bookingSource: z.enum(bookingSourceValues).default("reception"),
  reason: z.string().min(3),
  symptomsSummary: z.string().optional().or(z.literal("")),
  priority: z.enum(appointmentPriorityValues).default("normal"),
  notes: z.string().optional().or(z.literal("")),
});

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(appointmentStatusValues).optional(),
  priority: z.enum(appointmentPriorityValues).optional(),
  date: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const checkInAppointmentSchema = z.object({
  priority: z.enum(appointmentPriorityValues).optional(),
  queueType: z.enum(["appointment", "walk_in", "follow_up", "emergency"]).optional(),
  emergencyReason: z.string().optional().or(z.literal("")),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentDate: z.string().min(10),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  reason: z.string().optional().or(z.literal("")),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(appointmentStatusValues),
  reason: z.string().optional().or(z.literal("")),
});

export const followUpAppointmentSchema = createAppointmentSchema.extend({
  followUpForVisitId: z.string().min(5),
});
