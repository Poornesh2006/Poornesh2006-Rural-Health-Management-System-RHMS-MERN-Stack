import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { env } from "../config/env.js";
import { BackupJob } from "../models/backup-job.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Notification } from "../models/notification.model.js";
import { Patient } from "../models/patient.model.js";
import { QueueEntry } from "../models/queue-entry.model.js";
import { User } from "../models/user.model.js";

async function ensureBackupDirectory() {
  const absolutePath = path.resolve(process.cwd(), env.backupStoragePath);
  await fs.mkdir(absolutePath, { recursive: true });
  return absolutePath;
}

function encodePayload(jsonString) {
  return Buffer.from(`${env.backupEncryptionKey}:${jsonString}`, "utf8").toString("base64");
}

export const backupService = {
  async listBackups() {
    return BackupJob.find().sort({ createdAt: -1 }).lean();
  },

  async createBackup(triggeredBy, backupType = "manual") {
    const backupNumber = `BKP-${Date.now()}`;
    const job = await BackupJob.create({
      backupNumber,
      backupType,
      status: "running",
      startedAt: new Date(),
      triggeredBy,
      retentionUntil: new Date(Date.now() + env.retentionDays * 24 * 60 * 60 * 1000),
    });

    try {
      const [patients, appointments, queue, notifications, users] = await Promise.all([
        Patient.find().lean(),
        Appointment.find().lean(),
        QueueEntry.find().lean(),
        Notification.find().lean(),
        User.find().select("-passwordHash -refreshTokens -resetPasswordTokenHash").lean(),
      ]);

      const payload = {
        exportedAt: new Date().toISOString(),
        data: {
          patients,
          appointments,
          queue,
          notifications,
          users,
        },
      };

      const serialized = JSON.stringify(payload, null, 2);
      const encoded = encodePayload(serialized);
      const checksum = crypto.createHash("sha256").update(encoded).digest("hex");
      const backupDirectory = await ensureBackupDirectory();
      const filePath = path.join(backupDirectory, `${backupNumber}.json.enc`);
      await fs.writeFile(filePath, encoded, "utf8");

      const stats = await fs.stat(filePath);

      await BackupJob.findByIdAndUpdate(job._id, {
        completedAt: new Date(),
        status: "completed",
        storageLocation: filePath,
        checksum,
        size: stats.size,
      });

      return BackupJob.findById(job._id).lean();
    } catch (error) {
      await BackupJob.findByIdAndUpdate(job._id, {
        completedAt: new Date(),
        status: "failed",
        failureReason: error.message,
      });
      throw error;
    }
  },

  async requestRestore(backupId, userId) {
    const backup = await BackupJob.findById(backupId);

    if (!backup) {
      const error = new Error("Backup not found");
      error.statusCode = 404;
      throw error;
    }

    backup.restoreRequestedAt = new Date();
    backup.restoreRequestedBy = userId;
    backup.restoreStatus = "requested";
    await backup.save();

    return backup.toObject();
  },
};
