import { z } from "zod";

const stringList = z.array(z.string().trim().min(1)).optional().default([]);

export const createPatientSchema = z.object({
  firstName: z.string().min(2).max(60),
  lastName: z.string().min(1).max(60),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().min(10).max(15),
  aadhaarNumber: z.string().min(12).max(12).optional(),
  bloodGroup: z.string().max(10).optional(),
  email: z.string().email().optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  guardianName: z.string().max(120).optional(),
  emergencyContact: z.string().max(15).optional(),
  occupation: z.string().max(80).optional(),
  insurance: z.string().max(120).optional(),
  disability: z.string().max(120).optional(),
  address: z
    .object({
      village: z.string().max(120).optional(),
      district: z.string().max(120).optional(),
      state: z.string().max(120).optional(),
      pinCode: z.string().max(10).optional(),
    })
    .optional(),
  medicalFlags: z
    .object({
      medicalHistory: stringList,
      allergies: stringList,
      chronicDiseases: stringList,
      currentMedications: stringList,
    })
    .optional(),
  vitals: z
    .object({
      heightCm: z.coerce.number().positive().optional(),
      weightKg: z.coerce.number().positive().optional(),
    })
    .optional(),
  documents: z
    .array(
      z.object({
        label: z.string().min(2),
        url: z.string().url(),
        fileType: z.string().min(2),
      }),
    )
    .optional(),
  status: z.enum(["active", "archived", "inactive"]).optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
