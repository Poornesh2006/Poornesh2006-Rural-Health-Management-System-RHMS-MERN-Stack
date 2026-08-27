import mongoose from "mongoose";

const followUpTaskSchema = new mongoose.Schema(
  {
    taskNumber: { type: String, required: true, unique: true, index: true },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null, index: true },
    patientId: { type: String, default: "", index: true },
    patientName: { type: String, default: "" },
    householdRef: { type: mongoose.Schema.Types.ObjectId, ref: "Household", default: null, index: true },
    village: { type: String, default: "", index: true },
    category: {
      type: String,
      enum: [
        "due_today",
        "due_this_week",
        "overdue",
        "missed_once",
        "missed_multiple_times",
        "lab_review_pending",
        "vaccination_due",
        "prescription_follow_up",
        "referral_follow_up",
      ],
      default: "due_today",
      index: true,
    },
    reason: { type: String, required: true },
    dueDate: { type: Date, required: true, index: true },
    assignedUserRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    assignedToName: { type: String, default: "" },
    assignedRole: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "missed", "rescheduled"],
      default: "open",
      index: true,
    },
    lastContactAt: { type: Date, default: null },
    lastContact: { type: String, default: "" },
    notes: { type: String, default: "" },
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const FollowUpTask = mongoose.model("FollowUpTask", followUpTaskSchema);
