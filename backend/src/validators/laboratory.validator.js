import { z } from "zod";

export const labStatusValues = [
  "requested",
  "acknowledged",
  "sample_pending",
  "sample_collected",
  "processing",
  "completed",
  "verified",
  "doctor_reviewed",
  "recollection_required",
  "cancelled",
];

export const labTestPayloadSchema = z.object({
  testCode: z.string().min(2),
  testName: z.string().min(2),
  category: z.enum(["hematology", "biochemistry", "microbiology", "pathology", "urine", "serology", "imaging", "cardiology", "other"]).optional().default("other"),
  specimenType: z.string().optional().default(""),
  unit: z.string().optional().default(""),
  referenceRange: z.string().optional().default(""),
  preparationInstructions: z.string().optional().default(""),
  estimatedCompletionTime: z.coerce.number().min(0).optional().default(24),
  activeStatus: z.boolean().optional().default(true),
  defaultPrice: z.coerce.number().min(0).optional().default(0),
  parameters: z.array(
    z.object({
      name: z.string().min(1),
      unit: z.string().optional().default(""),
      referenceRange: z.string().optional().default(""),
      valueType: z.enum(["number", "text", "boolean", "dropdown"]).optional().default("number"),
      options: z.array(z.string()).optional().default([]),
    }),
  ).optional().default([]),
});

export const sampleCollectionSchema = z.object({
  specimenType: z.string().min(1),
  collectionDate: z.string().optional().or(z.literal("")).default(""),
  collectionLocation: z.string().optional().default(""),
});

export const labResultEntrySchema = z.object({
  parameters: z.array(
    z.object({
      name: z.string().min(1),
      value: z.string().optional().default(""),
      unit: z.string().optional().default(""),
      referenceRange: z.string().optional().default(""),
      flag: z.enum(["normal", "low", "high", "critical", "not_applicable"]).optional().default("not_applicable"),
      note: z.string().optional().default(""),
    }),
  ).optional().default([]),
  interpretation: z.string().optional().default(""),
  technicianNotes: z.string().optional().default(""),
  reportFiles: z.array(
    z.object({
      label: z.string().optional().default("Report"),
      url: z.string().url(),
      fileType: z.string().optional().default("pdf"),
    }),
  ).optional().default([]),
  criticalFlag: z.boolean().optional().default(false),
  criticalReason: z.string().optional().default(""),
});

export const recollectionSchema = z.object({
  rejectionReason: z.string().min(3),
});

export const doctorLabReviewSchema = z.object({
  reviewNote: z.string().optional().default(""),
});
