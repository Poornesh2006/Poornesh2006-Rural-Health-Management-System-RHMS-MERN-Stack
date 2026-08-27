import { z } from "zod";

export const medicinePayloadSchema = z.object({
  genericName: z.string().min(2),
  brandName: z.string().optional().default(""),
  category: z.string().optional().default("General"),
  dosageForm: z.enum(["tablet", "capsule", "syrup", "injection", "cream", "ointment", "drops", "inhaler", "powder", "sachet", "suspension", "device"]).optional().default("tablet"),
  strength: z.string().optional().default(""),
  unit: z.string().optional().default("unit"),
  manufacturer: z.string().optional().default(""),
  storageConditions: z.string().optional().default(""),
  prescriptionRequired: z.boolean().optional().default(true),
  activeStatus: z.boolean().optional().default(true),
  minimumStockLevel: z.coerce.number().min(0).optional().default(0),
  reorderLevel: z.coerce.number().min(0).optional().default(0),
});

export const supplierPayloadSchema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  address: z.object({
    line1: z.string().optional().default(""),
    line2: z.string().optional().default(""),
    city: z.string().optional().default(""),
    state: z.string().optional().default(""),
    pinCode: z.string().optional().default(""),
  }).optional().default({}),
  gstNumber: z.string().optional().default(""),
  licenseNumber: z.string().optional().default(""),
  activeStatus: z.boolean().optional().default(true),
  medicinesSupplied: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(""),
});

export const receiveStockSchema = z.object({
  medicineId: z.string().min(1),
  supplierId: z.string().optional().default(""),
  batchNumber: z.string().min(1),
  manufactureDate: z.string().optional().or(z.literal("")).default(""),
  expiryDate: z.string().min(1),
  purchasePrice: z.coerce.number().min(0).optional().default(0),
  unitCost: z.coerce.number().min(0),
  receivedQuantity: z.coerce.number().int().min(1),
  storageLocation: z.string().optional().default(""),
  receivedDate: z.string().optional().or(z.literal("")).default(""),
  purchaseReference: z.string().optional().default(""),
});

export const stockAdjustmentSchema = z.object({
  batchId: z.string().min(1),
  quantityChange: z.coerce.number().int(),
  movementType: z.enum(["adjustment", "damaged", "expired", "return", "recall"]),
  reason: z.string().min(3),
});

export const prescriptionDispenseSchema = z.object({
  items: z.array(
    z.object({
      itemIndex: z.coerce.number().int().min(0),
      batchId: z.string().optional().default(""),
      dispensedQuantity: z.coerce.number().int().min(0),
      markOutOfStock: z.boolean().optional().default(false),
      substitutionApproved: z.boolean().optional().default(false),
      substitutionMedicineName: z.string().optional().default(""),
      substitutionReason: z.string().optional().default(""),
    }),
  ).min(1),
  notes: z.string().optional().default(""),
  partialDispensingReason: z.string().optional().default(""),
  acknowledgement: z.boolean().optional().default(true),
});

export const substitutionDecisionSchema = z.object({
  itemIndex: z.coerce.number().int().min(0),
  suggestedMedicineId: z.string().optional().default(""),
  requestedMedicineName: z.string().optional().default(""),
  reason: z.string().min(3),
});
