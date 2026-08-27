import mongoose from "mongoose";

const documentVerificationSchema = new mongoose.Schema(
  {
    verificationCode: { type: String, required: true, unique: true, index: true },
    publicToken: { type: String, required: true, unique: true, index: true },
    documentType: {
      type: String,
      enum: ["prescription", "lab_report", "vaccination_certificate", "referral_letter", "patient_health_card", "medical_certificate"],
      required: true,
      index: true,
    },
    documentNumber: { type: String, required: true, index: true },
    status: { type: String, enum: ["valid", "invalid", "revoked"], default: "valid", index: true },
    issuingFacility: { type: String, default: "" },
    issueDate: { type: Date, default: Date.now },
    patientMaskedIdentifier: { type: String, default: "" },
    resourceType: { type: String, default: "" },
    resourceId: { type: String, default: "" },
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const DocumentVerification = mongoose.model("DocumentVerification", documentVerificationSchema);
