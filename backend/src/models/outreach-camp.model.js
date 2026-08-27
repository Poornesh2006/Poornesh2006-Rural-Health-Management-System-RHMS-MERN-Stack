import mongoose from "mongoose";

const outreachCampSchema = new mongoose.Schema(
  {
    campNumber: { type: String, required: true, unique: true, index: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    village: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    team: [{ type: String }],
    servicesOffered: [{ type: String }],
    expectedPatients: { type: Number, default: 0 },
    registeredPatients: { type: Number, default: 0 },
    vaccinations: { type: Number, default: 0 },
    screeningsRecorded: { type: Number, default: 0 },
    referrals: { type: Number, default: 0 },
    medicinesIssued: { type: Number, default: 0 },
    stockTransferred: { type: Number, default: 0 },
    summary: { type: String, default: "" },
    status: { type: String, enum: ["planned", "active", "completed", "cancelled"], default: "planned" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const OutreachCamp = mongoose.model("OutreachCamp", outreachCampSchema);
