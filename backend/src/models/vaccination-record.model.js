import mongoose from "mongoose";

const adverseEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, default: "", trim: true },
    severity: { type: String, default: "", trim: true },
    onsetTime: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    actionTaken: { type: String, default: "", trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    referralInformation: { type: String, default: "", trim: true },
    followUpRequired: { type: Boolean, default: false },
  },
  { _id: false },
);

const vaccinationRecordSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    vaccineRef: { type: mongoose.Schema.Types.ObjectId, ref: "Vaccine", required: true, index: true },
    batchRef: { type: mongoose.Schema.Types.ObjectId, ref: "VaccineBatch", required: true },
    doseNumber: { type: Number, required: true, min: 1 },
    administeredDate: { type: Date, default: Date.now, index: true },
    route: { type: String, default: "", trim: true },
    site: { type: String, default: "", trim: true },
    administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    facility: { type: String, default: "", trim: true },
    adverseEventObserved: { type: Boolean, default: false },
    adverseEventNotes: { type: String, default: "", trim: true },
    nextDoseDate: { type: Date, default: null },
    scheduleReference: { type: mongoose.Schema.Types.ObjectId, ref: "VaccinationSchedule", default: null },
    certificateNumber: { type: String, required: true, unique: true, index: true },
    notes: { type: String, default: "", trim: true },
    village: { type: String, default: "", trim: true },
    adverseEventRecord: { type: adverseEventSchema, default: null },
  },
  { timestamps: true },
);

vaccinationRecordSchema.index({ patientId: 1, vaccineRef: 1, doseNumber: 1 }, { unique: true });

export const VaccinationRecord = mongoose.model("VaccinationRecord", vaccinationRecordSchema);
