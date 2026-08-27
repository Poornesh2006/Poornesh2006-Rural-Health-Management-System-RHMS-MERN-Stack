import { z } from "zod";

export const createDoctorScheduleSchema = z.object({
  doctorId: z.string().min(5),
  workingDays: z.array(z.string()).min(1),
  shiftStart: z.string().min(4),
  shiftEnd: z.string().min(4),
  breakPeriods: z.array(z.object({ start: z.string().min(4), end: z.string().min(4) })).default([]),
  slotDuration: z.coerce.number().positive(),
  maximumAppointments: z.coerce.number().positive(),
  department: z.string().min(2),
  consultationRoom: z.string().min(1),
  unavailableDates: z.array(z.string()).optional().default([]),
  leaveDates: z.array(z.string()).optional().default([]),
  activeStatus: z.boolean().optional().default(true),
});

export const listAvailableSlotsSchema = z.object({
  doctorId: z.string().min(5),
  date: z.string().min(10),
});
