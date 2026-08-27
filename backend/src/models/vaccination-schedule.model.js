import mongoose from "mongoose";

const vaccinationScheduleSchema = new mongoose.Schema(
  {
    scheduleName: { type: String, required: true, trim: true },
    targetGroup: {
      type: String,
      enum: ["infant", "child", "adolescent", "adult", "pregnant", "senior_citizen", "high_risk"],
      required: true,
    },
    ageFrom: { type: Number, default: 0, min: 0 },
    ageTo: { type: Number, default: 1200, min: 0 },
    genderRestriction: { type: String, enum: ["male", "female", "other", "any"], default: "any" },
    pregnancyRequirement: { type: Boolean, default: false },
    vaccineRef: { type: mongoose.Schema.Types.ObjectId, ref: "Vaccine", required: true, index: true },
    doseNumber: { type: Number, required: true, min: 1 },
    minimumIntervalDays: { type: Number, default: 0, min: 0 },
    recommendedIntervalDays: { type: Number, default: 0, min: 0 },
    nextDoseRules: { type: String, default: "", trim: true },
    activeStatus: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

vaccinationScheduleSchema.index({ vaccineRef: 1, doseNumber: 1 }, { unique: true });

export const VaccinationSchedule = mongoose.model("VaccinationSchedule", vaccinationScheduleSchema);
