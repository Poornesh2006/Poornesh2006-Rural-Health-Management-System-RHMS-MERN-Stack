import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    organizationCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["government", "trust", "private", "academic", "ngo", "demonstration"],
      default: "government",
    },
    logo: { type: String, default: "" },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      district: { type: String, default: "" },
      state: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },
    contactDetails: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    registrationDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    defaultLanguage: { type: String, enum: ["en", "ta"], default: "en" },
    timezone: { type: String, default: "Asia/Kolkata" },
    activeStatus: { type: Boolean, default: true },
    dataRetentionPolicy: { type: mongoose.Schema.Types.Mixed, default: {} },
    securityPolicy: { type: mongoose.Schema.Types.Mixed, default: {} },
    featureFlags: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const Organization = mongoose.model("Organization", organizationSchema);
