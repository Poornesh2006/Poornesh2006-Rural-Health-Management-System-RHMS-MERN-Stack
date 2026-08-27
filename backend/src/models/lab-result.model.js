import mongoose from "mongoose";

const labResultParameterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, default: "", trim: true },
    unit: { type: String, default: "", trim: true },
    referenceRange: { type: String, default: "", trim: true },
    flag: { type: String, enum: ["normal", "low", "high", "critical", "not_applicable"], default: "not_applicable" },
    note: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const labResultSchema = new mongoose.Schema(
  {
    labRequestRef: { type: mongoose.Schema.Types.ObjectId, ref: "LabRequest", required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    visitRef: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true },
    testName: { type: String, required: true, trim: true },
    testRef: { type: mongoose.Schema.Types.ObjectId, ref: "LabTestCatalogue", default: null },
    parameters: { type: [labResultParameterSchema], default: [] },
    interpretation: { type: String, default: "", trim: true },
    technicianNotes: { type: String, default: "", trim: true },
    reportFiles: [{ label: String, url: String, fileType: String }],
    abnormalFlags: [{ type: String }],
    criticalFlag: { type: Boolean, default: false },
    criticalReason: { type: String, default: "", trim: true },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    doctorReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    doctorReviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export const LabResult = mongoose.model("LabResult", labResultSchema);
