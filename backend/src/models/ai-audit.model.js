import mongoose from "mongoose";

const aiAuditSchema = new mongoose.Schema(
  {
    feature: { type: String, required: true, index: true },
    provider: { type: String, default: "mock" },
    model: { type: String, default: "review-only" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    role: { type: String, default: "" },
    patientReference: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    inputDataCategories: [{ type: String }],
    redactionApplied: { type: Boolean, default: true },
    consentReference: { type: mongoose.Schema.Types.ObjectId, ref: "Consent", default: null },
    promptTemplateVersion: { type: String, default: "v1" },
    outputStatus: { type: String, enum: ["generated", "accepted", "edited", "rejected"], default: "generated" },
    accepted: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const AiAudit = mongoose.model("AiAudit", aiAuditSchema);
