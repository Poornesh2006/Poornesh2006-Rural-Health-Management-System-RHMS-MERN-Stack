import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    visitId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    doctorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    doctorName: { type: String, default: "" },
    symptoms: [{ type: String }],
    complaint: { type: String, default: "" },
    symptomDuration: { type: String, default: "" },
    provisionalDiagnosis: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    vitals: {
      heightCm: { type: Number, default: null },
      weightKg: { type: Number, default: null },
      bmi: { type: Number, default: null },
      pulse: { type: Number, default: null },
      temperatureC: { type: Number, default: null },
      bloodPressure: { type: String, default: "" },
      respiratoryRate: { type: Number, default: null },
      spo2: { type: Number, default: null },
      bloodGlucose: { type: Number, default: null },
      painScore: { type: Number, default: null },
    },
    advice: { type: String, default: "" },
    prescription: [{ name: String, strength: String, form: String, dose: String, frequency: String, route: String, duration: String, instructions: String, quantity: Number, notes: String }],
    labRequests: [{ testName: String, priority: String, clinicalNotes: String, requestedDate: Date, status: String }],
    notes: { type: String, default: "" },
    followUpDate: { type: Date, default: null },
    attachments: [{ label: String, url: String, fileType: String }],
    visitDate: { type: Date, default: Date.now, index: true },
    visitStatus: { type: String, enum: ["draft", "in_progress", "completed", "follow_up_due", "cancelled"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    appointmentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    queueEntryRef: { type: mongoose.Schema.Types.ObjectId, ref: "QueueEntry", default: null },
  },
  { timestamps: true },
);

visitSchema.index({ patientId: 1, visitDate: -1 });
visitSchema.index({ facilityRef: 1, visitDate: -1 });

export const Visit = mongoose.model("Visit", visitSchema);
