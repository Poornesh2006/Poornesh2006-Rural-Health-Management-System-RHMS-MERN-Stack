import { z } from "zod";

export const startConsultationSchema = z.object({
  queueEntryId: z.string().min(5),
});

export const completeConsultationSchema = z.object({
  queueEntryId: z.string().min(5),
  complaint: z.string().min(3),
  symptoms: z.array(z.string()).default([]),
  symptomDuration: z.string().optional().or(z.literal("")),
  provisionalDiagnosis: z.string().optional().or(z.literal("")),
  diagnosis: z.string().min(3),
  notes: z.string().optional().or(z.literal("")),
  advice: z.string().optional().or(z.literal("")),
  vitals: z
    .object({
      temperatureC: z.coerce.number().min(30).max(45).optional(),
      pulse: z.coerce.number().min(30).max(220).optional(),
      respiratoryRate: z.coerce.number().min(5).max(60).optional(),
      systolicBp: z.coerce.number().min(60).max(260).optional(),
      diastolicBp: z.coerce.number().min(30).max(180).optional(),
      spo2: z.coerce.number().min(40).max(100).optional(),
      heightCm: z.coerce.number().min(30).max(250).optional(),
      weightKg: z.coerce.number().min(1).max(300).optional(),
      bloodGlucose: z.coerce.number().min(20).max(600).optional(),
      painScore: z.coerce.number().min(0).max(10).optional(),
    })
    .optional(),
  prescription: z
    .array(
      z.object({
        name: z.string().min(2),
        strength: z.string().optional().or(z.literal("")),
        form: z.string().optional().or(z.literal("")),
        dose: z.string().min(1),
        frequency: z.string().min(1),
        route: z.string().optional().or(z.literal("")),
        duration: z.string().min(1),
        instructions: z.string().optional().or(z.literal("")),
        quantity: z.coerce.number().positive().optional(),
        notes: z.string().optional().or(z.literal("")),
      }),
    )
    .default([]),
  labRequests: z
    .array(
      z.object({
        testName: z.string().min(2),
        priority: z.string().optional().or(z.literal("")),
        clinicalNotes: z.string().optional().or(z.literal("")),
        requestedDate: z.string().optional().or(z.literal("")),
        status: z.string().optional().or(z.literal("")),
      }),
    )
    .default([]),
  followUp: z
    .object({
      enabled: z.boolean().default(false),
      appointmentDate: z.string().optional().or(z.literal("")),
      startTime: z.string().optional().or(z.literal("")),
      endTime: z.string().optional().or(z.literal("")),
      reason: z.string().optional().or(z.literal("")),
      department: z.string().optional().or(z.literal("")),
    })
    .optional(),
});
