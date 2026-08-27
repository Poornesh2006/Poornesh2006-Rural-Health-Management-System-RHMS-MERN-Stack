import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    alertNumber: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: [
        "emergency_workflow",
        "lab_critical",
        "low_medicine_stock",
        "expiring_batch",
        "vaccine_stock",
        "failed_sync",
        "failed_notification_delivery",
        "pending_referral",
        "overdue_follow_up",
        "data_quality",
      ],
      required: true,
      index: true,
    },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium", index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    sourceModule: { type: String, default: "" },
    sourceRecordId: { type: String, default: "" },
    assignedToName: { type: String, default: "" },
    status: { type: String, enum: ["open", "acknowledged", "resolved"], default: "open", index: true },
    acknowledgedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const Alert = mongoose.model("Alert", alertSchema);
