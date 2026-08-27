import mongoose from "mongoose";

const queueEntrySchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true },
    displayToken: { type: String, required: true, index: true },
    appointmentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    doctorName: { type: String, default: "" },
    department: { type: String, required: true, index: true },
    queueDate: { type: Date, required: true, index: true },
    queueType: { type: String, enum: ["appointment", "walk_in", "follow_up", "emergency"], default: "appointment" },
    priority: { type: String, enum: ["normal", "senior_citizen", "pregnant", "child", "disability", "emergency"], default: "normal", index: true },
    status: { type: String, enum: ["waiting", "called", "in_consultation", "skipped", "completed", "cancelled", "no_show"], default: "waiting", index: true },
    checkedInAt: { type: Date, default: null },
    calledAt: { type: Date, default: null },
    consultationStartedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    skippedAt: { type: Date, default: null },
    skippedCount: { type: Number, default: 0 },
    estimatedWaitMinutes: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    emergencyReason: { type: String, default: "" },
    noShowReason: { type: String, default: "" },
  },
  { timestamps: true },
);

queueEntrySchema.index({ queueDate: 1, department: 1, status: 1 });
queueEntrySchema.index({ doctorRef: 1, queueDate: 1, status: 1 });
queueEntrySchema.index({ patientId: 1, queueDate: -1 });
queueEntrySchema.index({ queueDate: 1, displayToken: 1 }, { unique: true });

export const QueueEntry = mongoose.model("QueueEntry", queueEntrySchema);
