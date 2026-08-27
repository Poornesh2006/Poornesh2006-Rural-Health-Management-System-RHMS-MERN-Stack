import mongoose from "mongoose";

const backupJobSchema = new mongoose.Schema(
  {
    backupNumber: { type: String, required: true, unique: true, index: true },
    backupType: { type: String, enum: ["manual", "scheduled", "pre_restore"], default: "manual" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    status: { type: String, enum: ["queued", "running", "completed", "failed", "deleted"], default: "queued", index: true },
    storageLocation: { type: String, default: "" },
    encrypted: { type: Boolean, default: true },
    size: { type: Number, default: 0 },
    checksum: { type: String, default: "" },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    retentionUntil: { type: Date, default: null },
    failureReason: { type: String, default: "" },
    restoreRequestedAt: { type: Date, default: null },
    restoreRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    restoreStatus: { type: String, enum: ["none", "requested", "blocked", "completed"], default: "none" },
  },
  { timestamps: true },
);

export const BackupJob = mongoose.model("BackupJob", backupJobSchema);
