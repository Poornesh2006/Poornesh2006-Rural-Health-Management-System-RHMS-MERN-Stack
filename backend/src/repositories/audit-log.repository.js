import { AuditLog } from "../models/audit-log.model.js";

export const auditLogRepository = {
  async create(payload) {
    const entry = await AuditLog.create(payload);
    return entry.toObject();
  },

  async recent(limit = 6) {
    return AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  },
};
