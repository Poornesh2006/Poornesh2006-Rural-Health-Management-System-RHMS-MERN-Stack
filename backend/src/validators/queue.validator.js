import { z } from "zod";
import { appointmentPriorityValues } from "./appointment.validator.js";

export const queueStatusValues = [
  "waiting",
  "called",
  "in_consultation",
  "skipped",
  "completed",
  "cancelled",
  "no_show",
];

export const queueActionSchema = z.object({
  reason: z.string().optional().or(z.literal("")),
});

export const queuePrioritySchema = z.object({
  priority: z.enum(appointmentPriorityValues),
  emergencyReason: z.string().optional().or(z.literal("")),
});

export const listQueueQuerySchema = z.object({
  doctorId: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(queueStatusValues).optional(),
  date: z.string().optional(),
});

export const queuePublicQuerySchema = z.object({
  department: z.string().optional(),
});
