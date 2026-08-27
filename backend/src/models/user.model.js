import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    sessionId: { type: String, default: "" },
    expiresAt: { type: Date, required: true },
  },
  { _id: false },
);

const activeSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    refreshTokenId: { type: String, required: true },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    deviceName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "doctor", "receptionist", "pharmacist", "lab_technician", "health_worker"],
      index: true,
    },
    avatarUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    primaryFacilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    allowedFacilities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility" }],
    allowedDepartments: [{ type: String }],
    regionScope: [{ type: String }],
    tenantRole: { type: String, default: "" },
    activeFacilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    temporaryAssignments: [
      {
        facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
        role: { type: String, default: "" },
        expiresAt: { type: Date, default: null },
      },
    ],
    loginHistory: [
      {
        at: { type: Date, default: Date.now },
        ipAddress: { type: String, default: "" },
        userAgent: { type: String, default: "" },
      },
    ],
    refreshTokens: [refreshTokenSchema],
    activeSessions: [activeSessionSchema],
    resetPasswordTokenHash: { type: String, default: "" },
    resetPasswordExpiresAt: { type: Date, default: null },
    permissions: [{ type: String }],
  },
  { timestamps: true },
);

userSchema.index({ fullName: "text", email: "text", phone: "text" });

export const User = mongoose.model("User", userSchema);
