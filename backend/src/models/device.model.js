import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true, index: true },
    deviceType: { type: String, default: "workstation" },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true },
    platform: { type: String, default: "" },
    appVersion: { type: String, default: "" },
    lastSeen: { type: Date, default: Date.now },
    pushToken: { type: String, default: "" },
    trustedStatus: { type: Boolean, default: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Device = mongoose.model("Device", deviceSchema);
