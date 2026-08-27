import mongoose from "mongoose";

const householdMemberSchema = new mongoose.Schema(
  {
    patientRef: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
    patientId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    relationship: {
      type: String,
      enum: ["father", "mother", "spouse", "son", "daughter", "guardian", "grandparent", "other"],
      default: "other",
    },
    lastVisitAt: { type: Date, default: null },
    vaccinationStatus: { type: String, default: "unknown" },
    followUpStatus: { type: String, default: "clear" },
    chronicConditionsSummary: [{ type: String }],
    upcomingAppointmentAt: { type: Date, default: null },
  },
  { _id: false },
);

const householdSchema = new mongoose.Schema(
  {
    householdId: { type: String, required: true, unique: true, index: true },
    familyName: { type: String, required: true, trim: true, index: true },
    village: { type: String, required: true, trim: true, index: true },
    address: { type: String, default: "" },
    headOfHousehold: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    assignedHealthWorkerRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedHealthWorkerName: { type: String, default: "" },
    notes: { type: String, default: "" },
    members: [householdMemberSchema],
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

householdSchema.index({ householdId: "text", familyName: "text", village: "text", headOfHousehold: "text" });

export const Household = mongoose.model("Household", householdSchema);
