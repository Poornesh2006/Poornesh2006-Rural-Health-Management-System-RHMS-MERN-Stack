import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";
import { MedicineBatch } from "../models/medicine-batch.model.js";
import { Medicine } from "../models/medicine.model.js";
import { DispensingRecord } from "../models/dispensing-record.model.js";
import { Prescription } from "../models/prescription.model.js";
import { StockMovement } from "../models/stock-movement.model.js";
import { Supplier } from "../models/supplier.model.js";
import { Patient } from "../models/patient.model.js";
import { Visit } from "../models/visit.model.js";
import { pharmacyRepository } from "../repositories/pharmacy.repository.js";
import {
  medicinePayloadSchema,
  prescriptionDispenseSchema,
  receiveStockSchema,
  stockAdjustmentSchema,
  substitutionDecisionSchema,
  supplierPayloadSchema,
} from "../validators/pharmacy.validator.js";
import { generateMedicineCode, generatePrescriptionNumber, generateSupplierCode } from "../utils/id-generator.js";
import { auditService } from "./audit.service.js";
import { notificationService } from "./notification.service.js";
import { socketService } from "./socket.service.js";

function ensureRole(actor, roles) {
  if (!roles.includes(actor?.role)) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }
}

function normalizeBatchStatus(batch, minimumStockLevel = 0) {
  const today = new Date();
  if (batch.expiryDate && new Date(batch.expiryDate) < today) return "expired";
  if (["quarantined", "recalled"].includes(batch.status)) return batch.status;
  if (batch.availableQuantity <= 0) return "exhausted";
  if (minimumStockLevel && batch.availableQuantity <= minimumStockLevel) return "low_stock";
  return "active";
}

async function recordStockMovement(payload, session) {
  await StockMovement.create([payload], { session });
}

export const pharmacyService = {
  async createMedicine(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.PHARMACIST]);
    const parsed = medicinePayloadSchema.parse(payload);
    const medicine = await pharmacyRepository.createMedicine({
      ...parsed,
      medicineCode: generateMedicineCode(),
      createdBy: actor?.sub || null,
      updatedBy: actor?.sub || null,
    });

    await auditService.record({ actor, action: "medicine_created", resourceType: "medicine", resourceId: medicine.medicineCode });
    return medicine;
  },

  async listMedicines(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const result = await pharmacyRepository.listMedicines({
      search: query.search || "",
      activeStatus: query.activeStatus === undefined ? undefined : query.activeStatus === "true",
      page,
      limit,
    });
    return { items: result.items, pagination: { page, limit, total: result.total } };
  },

  async updateMedicine(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.PHARMACIST]);
    const parsed = medicinePayloadSchema.partial().parse(payload);
    const medicine = await pharmacyRepository.findMedicineById(id);
    if (!medicine) {
      const error = new Error("Medicine not found");
      error.statusCode = 404;
      throw error;
    }
    Object.assign(medicine, parsed, { updatedBy: actor?.sub || null });
    await medicine.save();
    await auditService.record({ actor, action: "medicine_updated", resourceType: "medicine", resourceId: medicine.medicineCode });
    return medicine.toObject();
  },

  async deactivateMedicine(id, actor) {
    return this.updateMedicine(id, { activeStatus: false }, actor);
  },

  async createSupplier(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.PHARMACIST]);
    const parsed = supplierPayloadSchema.parse(payload);
    const supplier = await pharmacyRepository.createSupplier({
      ...parsed,
      supplierCode: generateSupplierCode(),
    });
    await auditService.record({ actor, action: "supplier_created", resourceType: "supplier", resourceId: supplier.supplierCode });
    return supplier;
  },

  async listSuppliers(query) {
    return pharmacyRepository.listSuppliers({ search: query.search || "" });
  },

  async updateSupplier(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.PHARMACIST]);
    const parsed = supplierPayloadSchema.partial().parse(payload);
    const supplier = await pharmacyRepository.findSupplierById(id);
    if (!supplier) {
      const error = new Error("Supplier not found");
      error.statusCode = 404;
      throw error;
    }
    Object.assign(supplier, parsed);
    await supplier.save();
    await auditService.record({ actor, action: "supplier_updated", resourceType: "supplier", resourceId: supplier.supplierCode });
    return supplier.toObject();
  },

  async deactivateSupplier(id, actor) {
    return this.updateSupplier(id, { activeStatus: false }, actor);
  },

  async receiveStock(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.PHARMACIST]);
    const parsed = receiveStockSchema.parse(payload);
    const medicine = await Medicine.findById(parsed.medicineId);
    if (!medicine) {
      const error = new Error("Medicine not found");
      error.statusCode = 404;
      throw error;
    }

    if (parsed.supplierId) {
      const supplier = await Supplier.findById(parsed.supplierId);
      if (!supplier) {
        const error = new Error("Supplier not found");
        error.statusCode = 404;
        throw error;
      }
    }

    const expiryDate = new Date(parsed.expiryDate);
    if (expiryDate <= new Date()) {
      const error = new Error("Cannot receive stock with an already expired batch");
      error.statusCode = 400;
      throw error;
    }

    const batch = await MedicineBatch.create({
      medicineRef: medicine._id,
      supplierRef: parsed.supplierId || null,
      batchNumber: parsed.batchNumber,
      manufactureDate: parsed.manufactureDate ? new Date(parsed.manufactureDate) : null,
      expiryDate,
      purchasePrice: parsed.purchasePrice,
      unitCost: parsed.unitCost,
      receivedQuantity: parsed.receivedQuantity,
      availableQuantity: parsed.receivedQuantity,
      storageLocation: parsed.storageLocation,
      receivedDate: parsed.receivedDate ? new Date(parsed.receivedDate) : new Date(),
      purchaseReference: parsed.purchaseReference,
      status: parsed.receivedQuantity <= medicine.minimumStockLevel ? "low_stock" : "active",
      createdBy: actor?.sub || null,
      updatedBy: actor?.sub || null,
    });

    await recordStockMovement({
      medicineRef: medicine._id,
      batchRef: batch._id,
      movementType: "purchase",
      quantity: parsed.receivedQuantity,
      quantityBefore: 0,
      quantityAfter: parsed.receivedQuantity,
      referenceType: "stock_receipt",
      referenceId: batch.batchNumber,
      reason: parsed.purchaseReference || "Stock received",
      performedBy: actor?.sub || null,
    });

    socketService.emit("pharmacy:stock-updated", { medicineId: String(medicine._id), batchId: String(batch._id) }, ["role:pharmacist"]);
    socketService.emit("analytics:pharmacy-updated", { scope: "stock" }, ["role:admin", "role:pharmacist"]);
    await auditService.record({ actor, action: "stock_received", resourceType: "medicine_batch", resourceId: batch.batchNumber });
    return batch.toObject();
  },

  async adjustStock(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.PHARMACIST]);
    const parsed = stockAdjustmentSchema.parse(payload);
    const batch = await MedicineBatch.findById(parsed.batchId).populate("medicineRef");
    if (!batch) {
      const error = new Error("Batch not found");
      error.statusCode = 404;
      throw error;
    }
    const quantityBefore = batch.availableQuantity;
    const quantityAfter = quantityBefore + parsed.quantityChange;
    if (quantityAfter < 0) {
      const error = new Error("Stock adjustment would result in negative quantity");
      error.statusCode = 400;
      throw error;
    }
    batch.availableQuantity = quantityAfter;
    batch.status = normalizeBatchStatus(batch, batch.medicineRef?.minimumStockLevel || 0);
    await batch.save();
    await recordStockMovement({
      medicineRef: batch.medicineRef._id,
      batchRef: batch._id,
      movementType: parsed.movementType,
      quantity: parsed.quantityChange,
      quantityBefore,
      quantityAfter,
      referenceType: "manual_adjustment",
      referenceId: batch.batchNumber,
      reason: parsed.reason,
      performedBy: actor?.sub || null,
    });
    await auditService.record({ actor, action: "stock_adjusted", resourceType: "medicine_batch", resourceId: batch.batchNumber, metadata: { reason: parsed.reason } });
    return batch.toObject();
  },

  async getMedicineAvailability(medicineId) {
    const batches = await pharmacyRepository.listMedicineBatches(medicineId);
    const activeBatches = batches.filter((batch) => !["expired", "quarantined", "recalled", "exhausted"].includes(batch.status));
    return {
      totalAvailable: activeBatches.reduce((sum, batch) => sum + batch.availableQuantity, 0),
      recommendedBatch: activeBatches[0] || null,
      batches: activeBatches,
    };
  },

  async listMedicineBatches(medicineId) {
    const batches = await pharmacyRepository.listMedicineBatches(medicineId);
    return batches.filter((batch) => !["expired", "quarantined", "recalled"].includes(batch.status));
  },

  async getLowStockList() {
    const medicines = await Medicine.find({ activeStatus: true }).lean();
    const batches = await MedicineBatch.find({ status: { $nin: ["expired", "quarantined", "recalled"] } }).lean();
    return medicines
      .map((medicine) => {
        const totalAvailable = batches
          .filter((batch) => String(batch.medicineRef) === String(medicine._id))
          .reduce((sum, batch) => sum + batch.availableQuantity, 0);
        return { ...medicine, totalAvailable };
      })
      .filter((medicine) => medicine.totalAvailable <= Math.max(medicine.minimumStockLevel, medicine.reorderLevel));
  },

  async getExpiryAlerts() {
    const now = new Date();
    const in7 = new Date(now);
    in7.setDate(in7.getDate() + 7);
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    const in90 = new Date(now);
    in90.setDate(in90.getDate() + 90);

    const batches = await pharmacyRepository.listAllBatches();
    return batches.map((batch) => {
      let risk = "active";
      if (new Date(batch.expiryDate) < now) risk = "expired";
      else if (new Date(batch.expiryDate) <= in7) risk = "expiring_7_days";
      else if (new Date(batch.expiryDate) <= in30) risk = "expiring_30_days";
      else if (new Date(batch.expiryDate) <= in90) risk = "expiring_90_days";
      return { ...batch, risk };
    }).filter((batch) => batch.risk !== "active");
  },

  async listPendingPrescriptions() {
    return pharmacyRepository.listPendingPrescriptions();
  },

  async getPrescriptionById(id) {
    const prescription = await pharmacyRepository.findPrescriptionById(id);
    if (!prescription) {
      const error = new Error("Prescription not found");
      error.statusCode = 404;
      throw error;
    }
    return prescription;
  },

  async dispensePrescription(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.PHARMACIST]);
    const parsed = prescriptionDispenseSchema.parse(payload);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const prescription = await Prescription.findById(id).session(session);
      if (!prescription) {
        const error = new Error("Prescription not found");
        error.statusCode = 404;
        throw error;
      }

      if (["fully_dispensed", "cancelled", "expired"].includes(prescription.status)) {
        const error = new Error("Prescription cannot be dispensed in its current status");
        error.statusCode = 409;
        throw error;
      }

      const dispensingItems = [];
      let anyPartial = false;
      let anyOutOfStock = false;

      for (const itemPayload of parsed.items) {
        const item = prescription.items[itemPayload.itemIndex];
        if (!item) {
          const error = new Error(`Prescription item ${itemPayload.itemIndex} not found`);
          error.statusCode = 400;
          throw error;
        }

        const remainingQuantity = Math.max(item.quantity - item.dispensedQuantity, 0);
        if (remainingQuantity <= 0) {
          continue;
        }

        if (itemPayload.markOutOfStock) {
          item.status = "out_of_stock";
          anyOutOfStock = true;
          anyPartial = true;
          dispensingItems.push({
            medicineRef: item.medicineRef || null,
            prescribedMedicineName: item.name,
            batchRef: null,
            prescribedQuantity: item.quantity,
            dispensedQuantity: 0,
            remainingQuantity,
            expiryDate: null,
            substitutionDetails: {
              approved: itemPayload.substitutionApproved,
              requestedMedicineName: item.name,
              dispensedMedicineName: itemPayload.substitutionMedicineName || "",
              reason: itemPayload.substitutionReason || "",
            },
            instructions: item.instructions || "",
          });
          continue;
        }

        if (!itemPayload.batchId) {
          const error = new Error(`Batch selection is required for ${item.name}`);
          error.statusCode = 400;
          throw error;
        }

        const batch = await MedicineBatch.findById(itemPayload.batchId).session(session);
        if (!batch) {
          const error = new Error("Selected batch not found");
          error.statusCode = 404;
          throw error;
        }

        if (["expired", "quarantined", "recalled", "exhausted"].includes(batch.status) || new Date(batch.expiryDate) <= new Date()) {
          const error = new Error(`Batch ${batch.batchNumber} is not valid for dispensing`);
          error.statusCode = 400;
          throw error;
        }

        if (itemPayload.dispensedQuantity > batch.availableQuantity) {
          const error = new Error(`Insufficient stock in batch ${batch.batchNumber}`);
          error.statusCode = 409;
          throw error;
        }

        const quantityBefore = batch.availableQuantity;
        batch.availableQuantity -= itemPayload.dispensedQuantity;
        batch.status = normalizeBatchStatus(batch);
        await batch.save({ session });

        await recordStockMovement({
          medicineRef: batch.medicineRef,
          batchRef: batch._id,
          movementType: "dispensing",
          quantity: itemPayload.dispensedQuantity * -1,
          quantityBefore,
          quantityAfter: batch.availableQuantity,
          referenceType: "prescription",
          referenceId: prescription.prescriptionNumber,
          reason: `Dispensed for ${prescription.patientId}`,
          performedBy: actor?.sub || null,
        }, session);

        item.dispensedQuantity += itemPayload.dispensedQuantity;
        const newRemaining = Math.max(item.quantity - item.dispensedQuantity, 0);
        if (newRemaining === 0) {
          item.status = itemPayload.substitutionApproved ? "substituted" : "dispensed";
        } else {
          item.status = "partially_dispensed";
          anyPartial = true;
        }

        dispensingItems.push({
          medicineRef: item.medicineRef || batch.medicineRef,
          prescribedMedicineName: item.name,
          batchRef: batch._id,
          prescribedQuantity: item.quantity,
          dispensedQuantity: itemPayload.dispensedQuantity,
          remainingQuantity: newRemaining,
          expiryDate: batch.expiryDate,
          substitutionDetails: {
            approved: itemPayload.substitutionApproved,
            requestedMedicineName: item.name,
            dispensedMedicineName: itemPayload.substitutionMedicineName || item.name,
            reason: itemPayload.substitutionReason || "",
          },
          instructions: item.instructions || "",
        });
      }

      prescription.pharmacistNotes = parsed.notes;
      prescription.partialDispensingReason = parsed.partialDispensingReason;
      prescription.dispensedAt = new Date();
      prescription.dispensedBy = actor?.sub || null;
      prescription.status = anyOutOfStock || anyPartial ? "partially_dispensed" : "fully_dispensed";
      await prescription.save({ session });

      const dispensingRecord = await DispensingRecord.create([
        {
          prescriptionRef: prescription._id,
          patientId: prescription.patientId,
          patientRef: prescription.patientRef,
          visitRef: prescription.visitRef,
          pharmacistRef: actor?.sub || null,
          items: dispensingItems,
          dispensedAt: new Date(),
          notes: parsed.notes,
          acknowledgement: parsed.acknowledgement,
        },
      ], { session }).then((items) => items[0]);

      await session.commitTransaction();

      await auditService.record({
        actor,
        action: prescription.status === "fully_dispensed" ? "prescription_dispensed" : "prescription_partially_dispensed",
        resourceType: "prescription",
        resourceId: prescription.prescriptionNumber,
      });

      socketService.emit("pharmacy:prescription-updated", { prescriptionId: String(prescription._id), status: prescription.status }, ["role:pharmacist"]);
      socketService.emit("pharmacy:stock-updated", { prescriptionId: String(prescription._id) }, ["role:pharmacist"]);
      socketService.emit("analytics:pharmacy-updated", { scope: "dispensing" }, ["role:admin", "role:pharmacist", ...(prescription.doctorRef ? [`doctor:${prescription.doctorRef}`] : [])]);

      await notificationService.create({
        title: prescription.status === "fully_dispensed" ? "Prescription completed" : "Prescription partially dispensed",
        description: `${prescription.prescriptionNumber} for ${prescription.patientId}`,
        audienceDoctorId: prescription.doctorRef ? String(prescription.doctorRef) : "",
        audienceRole: ROLES.PHARMACIST,
        entityType: "prescription",
        entityId: prescription.prescriptionNumber,
      });

      return {
        prescription: prescription.toObject(),
        dispensingRecord: dispensingRecord.toObject(),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async submitSubstitutionRequest(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.PHARMACIST]);
    const parsed = substitutionDecisionSchema.parse(payload);
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      const error = new Error("Prescription not found");
      error.statusCode = 404;
      throw error;
    }
    prescription.substitutionRequests.push({
      itemIndex: parsed.itemIndex,
      requestedMedicineName: parsed.requestedMedicineName,
      suggestedMedicineRef: parsed.suggestedMedicineId || null,
      reason: parsed.reason,
      requestedBy: actor?.sub || null,
      status: "pending",
    });
    await prescription.save();
    await notificationService.create({
      title: "Substitution approval required",
      description: `${prescription.prescriptionNumber} needs doctor approval`,
      audienceDoctorId: prescription.doctorRef ? String(prescription.doctorRef) : "",
      entityType: "prescription",
      entityId: prescription.prescriptionNumber,
    });
    return prescription.toObject();
  },

  async reviewSubstitution(id, requestIndex, approved, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.DOCTOR]);
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      const error = new Error("Prescription not found");
      error.statusCode = 404;
      throw error;
    }
    const request = prescription.substitutionRequests[requestIndex];
    if (!request) {
      const error = new Error("Substitution request not found");
      error.statusCode = 404;
      throw error;
    }
    request.status = approved ? "approved" : "rejected";
    request.reviewedBy = actor?.sub || null;
    request.reviewedAt = new Date();
    await prescription.save();
    await auditService.record({
      actor,
      action: approved ? "substitution_approved" : "substitution_rejected",
      resourceType: "prescription",
      resourceId: prescription.prescriptionNumber,
    });
    return prescription.toObject();
  },

  async getPatientHistory(patientId) {
    return pharmacyRepository.listPatientPrescriptions(patientId);
  },

  async getDispensingHistory(patientId) {
    return pharmacyRepository.listPatientDispensingHistory(patientId);
  },

  async getDailyStatistics() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [pending, dispensedToday, partial, lowStock, expiryAlerts, movements] = await Promise.all([
      Prescription.countDocuments({ status: { $in: ["created", "pending_pharmacy", "partially_dispensed"] } }),
      DispensingRecord.countDocuments({ dispensedAt: { $gte: start } }),
      Prescription.countDocuments({ status: "partially_dispensed" }),
      this.getLowStockList(),
      this.getExpiryAlerts(),
      StockMovement.find({ createdAt: { $gte: start } }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);
    return {
      pendingPrescriptions: pending,
      dispensedToday,
      partiallyDispensed: partial,
      lowStockCount: lowStock.length,
      expiryAlertCount: expiryAlerts.length,
      recentStockMovements: movements,
    };
  },

  async createPrescriptionFromVisit(visit, session) {
    if (!visit.prescription?.length) {
      return null;
    }

    const patient = await Patient.findById(visit.patientRef).session(session);
    if (!patient) {
      return null;
    }

    const existingPrescription = await Prescription.findOne({ visitRef: visit._id }).session(session);
    if (existingPrescription) {
      return existingPrescription;
    }

    const resolvedItems = await Promise.all(
      visit.prescription.map(async (item) => {
        const medicine = await Medicine.findOne({
          $or: [
            { genericName: new RegExp(`^${item.name}$`, "i") },
            { brandName: new RegExp(`^${item.name}$`, "i") },
          ],
        }).session(session);
        return {
          medicineRef: medicine?._id || null,
          name: item.name,
          strength: item.strength || "",
          form: item.form || "",
          dose: item.dose || "",
          frequency: item.frequency || "",
          route: item.route || "",
          duration: item.duration || "",
          instructions: item.instructions || "",
          quantity: item.quantity || 0,
          notes: item.notes || "",
          status: "pending",
        };
      }),
    );

    const prescription = await Prescription.create([
      {
        prescriptionNumber: generatePrescriptionNumber(),
        patientId: visit.patientId,
        patientRef: patient._id,
        visitRef: visit._id,
        doctorRef: visit.doctorRef,
        doctorName: visit.doctorName,
        items: resolvedItems,
        status: "pending_pharmacy",
        issuedAt: new Date(),
      },
    ], { session }).then((items) => items[0]);

    return prescription;
  },
};
