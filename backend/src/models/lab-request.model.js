import mongoose from "mongoose";

const labRequestTestSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true, trim: true },
    testRef: { type: mongoose.Schema.Types.ObjectId, ref: "LabTestCatalogue", default: null },
    priority: { type: String, enum: ["routine", "urgent", "emergency"], default: "routine" },
    clinicalNotes: { type: String, default: "", trim: true },
    requestedDate: { type: Date, default: Date.now },
    status: { type: String, default: "requested" },
  },
  { _id: false },
);

const labRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    visitRef: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true, index: true },
    doctorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    doctorName: { type: String, default: "", trim: true },
    tests: { type: [labRequestTestSchema], default: [] },
    priority: { type: String, enum: ["routine", "urgent", "emergency"], default: "routine", index: true },
    clinicalNotes: { type: String, default: "", trim: true },
    requestedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["requested", "acknowledged", "sample_pending", "sample_collected", "processing", "completed", "verified", "doctor_reviewed", "recollection_required", "cancelled"],
      default: "requested",
      index: true,
    },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sampleCollectedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    doctorReviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const LabRequest = mongoose.model("LabRequest", labRequestSchema);
