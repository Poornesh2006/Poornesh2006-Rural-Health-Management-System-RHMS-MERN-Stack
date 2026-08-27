import mongoose from "mongoose";

const consentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    sourceFacility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    receivingFacility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    consentType: {
      type: String,
      enum: ["referral", "cross-facility-record-access", "lab-report-sharing", "prescription-sharing", "vaccination-sharing", "research-aggregation", "notification", "external-integration"],
      required: true,
    },
    purpose: { type: String, required: true, trim: true },
    scope: { type: String, default: "summary" },
    grantedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    status: { type: String, enum: ["active", "expired", "revoked", "denied", "pending"], default: "active", index: true },
    capturedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    method: { type: String, default: "written" },
    document: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

consentSchema.index({ patient: 1, sourceFacility: 1, receivingFacility: 1, consentType: 1, status: 1 });

export const Consent = mongoose.model("Consent", consentSchema);
