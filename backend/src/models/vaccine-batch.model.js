import mongoose from "mongoose";

const vaccineBatchSchema = new mongoose.Schema(
  {
    vaccineRef: { type: mongoose.Schema.Types.ObjectId, ref: "Vaccine", required: true, index: true },
    batchNumber: { type: String, required: true, trim: true },
    manufactureDate: { type: Date, default: null },
    expiryDate: { type: Date, required: true, index: true },
    receivedQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    storageLocation: { type: String, default: "", trim: true },
    coldChainStatus: { type: String, default: "maintained", trim: true },
    supplierRef: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    receivedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "low_stock", "expired", "quarantined", "exhausted", "recalled"], default: "active", index: true },
  },
  { timestamps: true },
);

vaccineBatchSchema.index({ vaccineRef: 1, batchNumber: 1 }, { unique: true });

export const VaccineBatch = mongoose.model("VaccineBatch", vaccineBatchSchema);
