import { z } from "zod";

export const vaccinePayloadSchema = z.object({
  vaccineName: z.string().min(2),
  diseaseProtected: z.string().optional().default(""),
  manufacturer: z.string().optional().default(""),
  route: z.string().optional().default(""),
  dosage: z.string().optional().default(""),
  storageTemperature: z.string().optional().default(""),
  ageEligibility: z.object({
    minMonths: z.coerce.number().min(0).optional().default(0),
    maxMonths: z.coerce.number().min(0).optional().default(1200),
  }).optional().default({}),
  doseSchedule: z.array(z.string()).optional().default([]),
  activeStatus: z.boolean().optional().default(true),
});

export const vaccineBatchSchema = z.object({
  vaccineId: z.string().min(1),
  supplierId: z.string().optional().default(""),
  batchNumber: z.string().min(1),
  manufactureDate: z.string().optional().or(z.literal("")).default(""),
  expiryDate: z.string().min(1),
  receivedQuantity: z.coerce.number().int().min(1),
  storageLocation: z.string().optional().default(""),
  coldChainStatus: z.string().optional().default("maintained"),
  receivedDate: z.string().optional().or(z.literal("")).default(""),
});

export const vaccinationScheduleSchema = z.object({
  scheduleName: z.string().min(2),
  targetGroup: z.enum(["infant", "child", "adolescent", "adult", "pregnant", "senior_citizen", "high_risk"]),
  ageFrom: z.coerce.number().min(0).optional().default(0),
  ageTo: z.coerce.number().min(0).optional().default(1200),
  genderRestriction: z.enum(["male", "female", "other", "any"]).optional().default("any"),
  pregnancyRequirement: z.boolean().optional().default(false),
  vaccineId: z.string().min(1),
  doseNumber: z.coerce.number().int().min(1),
  minimumIntervalDays: z.coerce.number().min(0).optional().default(0),
  recommendedIntervalDays: z.coerce.number().min(0).optional().default(0),
  nextDoseRules: z.string().optional().default(""),
  activeStatus: z.boolean().optional().default(true),
});

export const administerVaccinationSchema = z.object({
  patientId: z.string().min(1),
  vaccineId: z.string().min(1),
  batchId: z.string().min(1),
  doseNumber: z.coerce.number().int().min(1),
  administeredDate: z.string().optional().or(z.literal("")).default(""),
  route: z.string().min(1),
  site: z.string().min(1),
  facility: z.string().optional().default("RPHC"),
  scheduleId: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  adverseEventObserved: z.boolean().optional().default(false),
  adverseEventNotes: z.string().optional().default(""),
});

export const adverseEventSchema = z.object({
  eventType: z.string().min(2),
  severity: z.string().min(2),
  onsetTime: z.string().optional().default(""),
  description: z.string().min(3),
  actionTaken: z.string().optional().default(""),
  referralInformation: z.string().optional().default(""),
  followUpRequired: z.boolean().optional().default(false),
});
