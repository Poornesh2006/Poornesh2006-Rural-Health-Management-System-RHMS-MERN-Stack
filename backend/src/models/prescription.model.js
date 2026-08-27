import mongoose from "mongoose";

const substitutionRequestSchema = new mongoose.Schema(
  {
    itemIndex: { type: Number, required: true },
    requestedMedicineName: { type: String, default: "", trim: true },
    suggestedMedicineRef: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", default: null },
    reason: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { _id: false },
);

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineRef: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", default: null },
    name: { type: String, required: true, trim: true },
    strength: { type: String, default: "", trim: true },
    form: { type: String, default: "", trim: true },
    dose: { type: String, default: "", trim: true },
    frequency: { type: String, default: "", trim: true },
    route: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
    instructions: { type: String, default: "", trim: true },
    quantity: { type: Number, required: true, min: 0 },
    dispensedQuantity: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "dispensed", "partially_dispensed", "out_of_stock", "substituted", "cancelled"],
      default: "pending",
    },
  },
  { _id: false },
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    visitRef: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true, index: true },
    doctorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    doctorName: { type: String, default: "", trim: true },
    items: { type: [prescriptionItemSchema], default: [] },
    status: {
      type: String,
      enum: ["created", "pending_pharmacy", "partially_dispensed", "fully_dispensed", "cancelled", "expired"],
      default: "pending_pharmacy",
      index: true,
    },
    issuedAt: { type: Date, default: Date.now },
    dispensedAt: { type: Date, default: null },
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    partialDispensingReason: { type: String, default: "", trim: true },
    pharmacistNotes: { type: String, default: "", trim: true },
    substitutionRequests: { type: [substitutionRequestSchema], default: [] },
  },
  { timestamps: true },
);

prescriptionSchema.index({ patientId: 1, issuedAt: -1 });

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
