import mongoose from "mongoose";

const featureFlagSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
    environmentScope: { type: [String], default: [] },
    organizationScope: [{ type: mongoose.Schema.Types.ObjectId, ref: "Organization" }],
    facilityScope: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility" }],
    roleScope: [{ type: String }],
    userScope: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const FeatureFlag = mongoose.model("FeatureFlag", featureFlagSchema);
