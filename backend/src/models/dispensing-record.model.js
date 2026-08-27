import mongoose from "mongoose";

const dispensingItemSchema = new mongoose.Schema(
  {
    medicineRef: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", default: null },
    prescribedMedicineName: { type: String, required: true, trim: true },
    batchRef: { type: mongoose.Schema.Types.ObjectId, ref: "MedicineBatch", default: null },
    prescribedQuantity: { type: Number, required: true, min: 0 },
    dispensedQuantity: { type: Number, required: true, min: 0 },
    remainingQuantity: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date, default: null },
    substitutionDetails: {
      approved: { type: Boolean, default: false },
      requestedMedicineName: { type: String, default: "", trim: true },
      dispensedMedicineName: { type: String, default: "", trim: true },
      reason: { type: String, default: "", trim: true },
    },
    instructions: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const dispensingRecordSchema = new mongoose.Schema(
  {
    prescriptionRef: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    visitRef: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true },
    pharmacistRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    items: { type: [dispensingItemSchema], default: [] },
    dispensedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "", trim: true },
    acknowledgement: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const DispensingRecord = mongoose.model("DispensingRecord", dispensingRecordSchema);
