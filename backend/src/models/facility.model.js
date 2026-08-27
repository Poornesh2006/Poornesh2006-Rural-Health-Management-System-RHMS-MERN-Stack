import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema(
  {
    facilityCode: { type: String, required: true, unique: true, index: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    parentFacility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    facilityType: {
      type: String,
      enum: ["PHC", "sub_centre", "urban_PHC", "district_hospital", "outreach_camp", "mobile_unit", "referral_centre"],
      default: "PHC",
    },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, default: "" },
    address: {
      line1: { type: String, default: "" },
      district: { type: String, default: "" },
      block: { type: String, default: "" },
      village: { type: String, default: "" },
      state: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    workingHours: { type: String, default: "09:00 - 16:00" },
    departments: [{ type: String }],
    services: [{ type: String }],
    branding: { type: mongoose.Schema.Types.Mixed, default: {} },
    tokenConfiguration: { type: mongoose.Schema.Types.Mixed, default: {} },
    notificationConfiguration: { type: mongoose.Schema.Types.Mixed, default: {} },
    languageConfiguration: { type: mongoose.Schema.Types.Mixed, default: {} },
    activeStatus: { type: Boolean, default: true },
  },
  { timestamps: true },
);

facilitySchema.index({ organization: 1, name: 1 });

export const Facility = mongoose.model("Facility", facilitySchema);
