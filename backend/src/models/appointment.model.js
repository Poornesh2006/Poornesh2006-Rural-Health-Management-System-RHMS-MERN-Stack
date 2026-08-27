import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: { type: String, required: true, unique: true, index: true },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    patientId: { type: String, required: true, index: true },
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    doctorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    doctorName: { type: String, default: "" },
    department: { type: String, required: true, index: true },
    appointmentDate: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    appointmentType: { type: String, default: "general_consultation" },
    bookingSource: {
      type: String,
      enum: ["reception", "doctor", "health_worker", "follow_up", "online", "walk_in"],
      default: "reception",
    },
    reason: { type: String, required: true },
    symptomsSummary: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["normal", "senior_citizen", "pregnant", "child", "disability", "emergency"],
      default: "normal",
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "checked_in", "waiting", "called", "in_consultation", "completed", "cancelled", "missed", "rescheduled"],
      default: "scheduled",
      index: true,
    },
    tokenRef: { type: mongoose.Schema.Types.ObjectId, ref: "QueueEntry", default: null },
    queueEntryRef: { type: mongoose.Schema.Types.ObjectId, ref: "QueueEntry", default: null },
    checkedInAt: { type: Date, default: null },
    consultationStartedAt: { type: Date, default: null },
    consultationCompletedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: "" },
    missedAt: { type: Date, default: null },
    rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    rescheduledTo: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    followUpForVisit: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "" },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

appointmentSchema.index({ doctorRef: 1, appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ facilityRef: 1, appointmentDate: 1, status: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
