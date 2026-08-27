import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    genericName: { type: String, required: true, index: true, trim: true },
    brandName: { type: String, default: "", index: true, trim: true },
    medicineCode: { type: String, required: true, unique: true, index: true, trim: true },
    category: { type: String, default: "General", index: true, trim: true },
    dosageForm: {
      type: String,
      enum: ["tablet", "capsule", "syrup", "injection", "cream", "ointment", "drops", "inhaler", "powder", "sachet", "suspension", "device"],
      default: "tablet",
    },
    strength: { type: String, default: "", trim: true },
    unit: { type: String, default: "unit", trim: true },
    manufacturer: { type: String, default: "", trim: true },
    storageConditions: { type: String, default: "", trim: true },
    prescriptionRequired: { type: Boolean, default: true },
    activeStatus: { type: Boolean, default: true, index: true },
    minimumStockLevel: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

medicineSchema.index({ genericName: "text", brandName: "text", manufacturer: "text" });

export const Medicine = mongoose.model("Medicine", medicineSchema);
