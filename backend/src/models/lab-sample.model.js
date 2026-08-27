import mongoose from "mongoose";

const labSampleSchema = new mongoose.Schema(
  {
    labRequestRef: { type: mongoose.Schema.Types.ObjectId, ref: "LabRequest", required: true, index: true },
    sampleId: { type: String, required: true, unique: true, index: true },
    specimenType: { type: String, default: "", trim: true },
    collectionDate: { type: Date, default: Date.now },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    collectionLocation: { type: String, default: "", trim: true },
    status: { type: String, enum: ["sample_collected", "rejected", "processing", "completed"], default: "sample_collected" },
    rejectionReason: { type: String, default: "", trim: true },
    recollectionRequired: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const LabSample = mongoose.model("LabSample", labSampleSchema);
