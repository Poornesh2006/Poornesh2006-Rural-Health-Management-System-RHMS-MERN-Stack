import { auditLogRepository } from "../repositories/audit-log.repository.js";

export const auditService = {
  async record({ actor, action, resourceType, resourceId = "", metadata = {}, ipAddress = "" }) {
    return auditLogRepository.create({
      actorId: actor?.sub || actor?.id || "",
      actorRole: actor?.role || "",
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress,
    });
  },
};
