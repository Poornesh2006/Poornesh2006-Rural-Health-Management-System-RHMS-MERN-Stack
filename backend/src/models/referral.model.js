import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referralNumber: { type: String, required: true, unique: true, index: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    sourceFacility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    sourceDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    destinationFacility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    destinationDepartment: { type: String, default: "" },
    destinationDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reason: { type: String, required: true },
    urgency: { type: String, enum: ["routine", "priority", "urgent", "emergency-transfer"], default: "routine" },
    clinicalSummary: { type: String, default: "" },
    selectedDocuments: [{ type: String }],
    consent: { type: mongoose.Schema.Types.ObjectId, ref: "Consent", default: null },
    status: {
      type: String,
      enum: ["draft", "pending_consent", "sent", "accepted", "rejected", "scheduled", "patient_arrived", "in_review", "completed", "cancelled"],
      default: "draft",
      index: true,
    },
    sentAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    outcomeSummary: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const Referral = mongoose.model("Referral", referralSchema);
