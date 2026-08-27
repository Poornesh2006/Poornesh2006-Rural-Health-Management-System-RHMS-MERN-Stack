import mongoose from "mongoose";

const vaccineSchema = new mongoose.Schema(
  {
    vaccineCode: { type: String, required: true, unique: true, index: true },
    vaccineName: { type: String, required: true, trim: true, index: true },
    diseaseProtected: { type: String, default: "", trim: true },
    manufacturer: { type: String, default: "", trim: true },
    route: { type: String, default: "", trim: true },
    dosage: { type: String, default: "", trim: true },
    storageTemperature: { type: String, default: "", trim: true },
    ageEligibility: {
      minMonths: { type: Number, default: 0, min: 0 },
      maxMonths: { type: Number, default: 1200, min: 0 },
    },
    doseSchedule: [{ type: String }],
    activeStatus: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

vaccineSchema.index({ vaccineCode: "text", vaccineName: "text", diseaseProtected: "text" });

export const Vaccine = mongoose.model("Vaccine", vaccineSchema);
