import { z } from "zod";

export const createVisitSchema = z.object({
  patientId: z.string().min(5),
  doctorName: z.string().min(2).optional().or(z.literal("")),
  symptoms: z.array(z.string()).optional().default([]),
  complaint: z.string().optional().or(z.literal("")),
  diagnosis: z.string().optional().or(z.literal("")),
  vitals: z
    .object({
      heightCm: z.coerce.number().positive().optional(),
      weightKg: z.coerce.number().positive().optional(),
      pulse: z.coerce.number().positive().optional(),
      temperatureC: z.coerce.number().positive().optional(),
      bloodPressure: z.string().optional().or(z.literal("")),
    })
    .optional(),
  prescription: z
    .array(
      z.object({
        name: z.string().min(2),
        dosage: z.string().min(1),
        instructions: z.string().min(1),
      }),
    )
    .optional()
    .default([]),
  labRequests: z.array(z.string()).optional().default([]),
  notes: z.string().optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  attachments: z
    .array(
      z.object({
        label: z.string().min(2),
        url: z.string().url(),
        fileType: z.string().min(2),
      }),
    )
    .optional()
    .default([]),
});
