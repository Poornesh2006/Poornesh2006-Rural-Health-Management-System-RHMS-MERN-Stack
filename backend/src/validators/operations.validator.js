import { z } from "zod";

const relationshipValues = ["father", "mother", "spouse", "son", "daughter", "guardian", "grandparent", "other"];

export const duplicateCheckSchema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  age: z.coerce.number().optional(),
  phone: z.string().optional().default(""),
  village: z.string().optional().default(""),
  guardianName: z.string().optional().default(""),
  address: z.string().optional().default(""),
  gender: z.string().optional().default(""),
  identifiers: z.array(z.string()).optional().default([]),
});

export const createHouseholdSchema = z.object({
  familyName: z.string().min(2),
  village: z.string().min(2),
  address: z.string().optional().default(""),
  headOfHousehold: z.string().optional().default(""),
  contactNumber: z.string().optional().default(""),
  assignedHealthWorkerName: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  members: z.array(
    z.object({
      patientId: z.string().min(2),
      name: z.string().min(2),
      relationship: z.enum(relationshipValues).default("other"),
    }),
  ).optional().default([]),
});

export const createFollowUpTaskSchema = z.object({
  patientId: z.string().optional().default(""),
  patientName: z.string().optional().default(""),
  village: z.string().optional().default(""),
  category: z.enum([
    "due_today",
    "due_this_week",
    "overdue",
    "missed_once",
    "missed_multiple_times",
    "lab_review_pending",
    "vaccination_due",
    "prescription_follow_up",
    "referral_follow_up",
  ]),
  reason: z.string().min(2),
  dueDate: z.string(),
  assignedToName: z.string().optional().default(""),
  assignedRole: z.string().optional().default(""),
  lastContact: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export const updateFollowUpTaskSchema = createFollowUpTaskSchema.partial().extend({
  status: z.enum(["open", "in_progress", "completed", "missed", "rescheduled"]).optional(),
});

export const createShiftHandoverSchema = z.object({
  title: z.string().min(2),
  handoverNote: z.string().optional().default(""),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  assignedPerson: z.string().optional().default(""),
  expectedAction: z.string().optional().default(""),
  dueTime: z.string().optional().default(""),
  incomingStaffName: z.string().optional().default(""),
  module: z.string().optional().default("operations"),
  relatedRecordId: z.string().optional().default(""),
});

export const updateShiftHandoverSchema = z.object({
  status: z.enum(["open", "acknowledged", "resolved"]).optional(),
  comment: z.string().optional().default(""),
});

export const createAlertSchema = z.object({
  category: z.enum([
    "emergency_workflow",
    "lab_critical",
    "low_medicine_stock",
    "expiring_batch",
    "vaccine_stock",
    "failed_sync",
    "failed_notification_delivery",
    "pending_referral",
    "overdue_follow_up",
    "data_quality",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  title: z.string().min(2),
  description: z.string().optional().default(""),
  sourceModule: z.string().optional().default(""),
  sourceRecordId: z.string().optional().default(""),
  assignedToName: z.string().optional().default(""),
});

export const createDocumentVerificationSchema = z.object({
  documentType: z.enum(["prescription", "lab_report", "vaccination_certificate", "referral_letter", "patient_health_card", "medical_certificate"]),
  documentNumber: z.string().min(2),
  issuingFacility: z.string().optional().default(""),
  issueDate: z.string().optional().default(""),
  patientMaskedIdentifier: z.string().optional().default(""),
  resourceType: z.string().optional().default(""),
  resourceId: z.string().optional().default(""),
});

export const searchSchema = z.object({
  q: z.string().min(1),
});
