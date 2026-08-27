import mongoose from "mongoose";

const medicineBatchSchema = new mongoose.Schema(
  {
    medicineRef: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true, index: true },
    batchNumber: { type: String, required: true, trim: true },
    supplierRef: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    manufactureDate: { type: Date, default: null },
    expiryDate: { type: Date, required: true, index: true },
    purchasePrice: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    receivedQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    damagedQuantity: { type: Number, default: 0, min: 0 },
    returnedQuantity: { type: Number, default: 0, min: 0 },
    storageLocation: { type: String, default: "", trim: true },
    receivedDate: { type: Date, default: Date.now },
    purchaseReference: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["active", "low_stock", "expired", "quarantined", "exhausted", "recalled"],
      default: "active",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

medicineBatchSchema.index({ medicineRef: 1, batchNumber: 1 }, { unique: true });

export const MedicineBatch = mongoose.model("MedicineBatch", medicineBatchSchema);
