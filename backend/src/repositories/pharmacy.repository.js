import { DispensingRecord } from "../models/dispensing-record.model.js";
import { MedicineBatch } from "../models/medicine-batch.model.js";
import { Medicine } from "../models/medicine.model.js";
import { Prescription } from "../models/prescription.model.js";
import { StockMovement } from "../models/stock-movement.model.js";
import { Supplier } from "../models/supplier.model.js";

export const pharmacyRepository = {
  async createMedicine(payload) {
    const medicine = await Medicine.create(payload);
    return medicine.toObject();
  },

  async findMedicineById(id) {
    return Medicine.findById(id);
  },

  async listMedicines({ search = "", activeStatus, page = 1, limit = 10 } = {}) {
    const query = {};
    if (typeof activeStatus === "boolean") query.activeStatus = activeStatus;
    if (search) {
      query.$or = [
        { genericName: new RegExp(search, "i") },
        { brandName: new RegExp(search, "i") },
        { medicineCode: new RegExp(search, "i") },
      ];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Medicine.find(query).sort({ genericName: 1 }).skip(skip).limit(limit).lean(),
      Medicine.countDocuments(query),
    ]);
    return { items, total };
  },

  async createSupplier(payload) {
    const supplier = await Supplier.create(payload);
    return supplier.toObject();
  },

  async findSupplierById(id) {
    return Supplier.findById(id);
  },

  async listSuppliers({ search = "" } = {}) {
    const query = search ? { $or: [{ name: new RegExp(search, "i") }, { supplierCode: new RegExp(search, "i") }] } : {};
    return Supplier.find(query).sort({ name: 1 }).lean();
  },

  async findBatchById(id) {
    return MedicineBatch.findById(id).populate("medicineRef").populate("supplierRef");
  },

  async listMedicineBatches(medicineId) {
    return MedicineBatch.find({ medicineRef: medicineId }).sort({ expiryDate: 1 }).lean();
  },

  async listAllBatches(query = {}) {
    return MedicineBatch.find(query).sort({ expiryDate: 1 }).populate("medicineRef").populate("supplierRef").lean();
  },

  async listStockMovements({ medicineId, batchId } = {}) {
    const query = {};
    if (medicineId) query.medicineRef = medicineId;
    if (batchId) query.batchRef = batchId;
    return StockMovement.find(query).sort({ createdAt: -1 }).populate("medicineRef").populate("batchRef").lean();
  },

  async listPendingPrescriptions() {
    return Prescription.find({ status: { $in: ["created", "pending_pharmacy", "partially_dispensed"] } })
      .sort({ createdAt: -1 })
      .lean();
  },

  async findPrescriptionById(id) {
    return Prescription.findById(id);
  },

  async listPatientPrescriptions(patientId) {
    return Prescription.find({ patientId }).sort({ issuedAt: -1 }).lean();
  },

  async listPatientDispensingHistory(patientId) {
    return DispensingRecord.find({ patientId }).sort({ dispensedAt: -1 }).lean();
  },
};
