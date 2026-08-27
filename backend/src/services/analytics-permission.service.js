import { ROLES } from "../constants/roles.js";

const permissions = {
  executive: [ROLES.ADMIN],
  patients: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.HEALTH_WORKER],
  appointments: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST],
  queue: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST],
  doctors: [ROLES.ADMIN, ROLES.DOCTOR],
  pharmacy: [ROLES.ADMIN, ROLES.PHARMACIST, ROLES.DOCTOR],
  laboratory: [ROLES.ADMIN, ROLES.LAB_TECHNICIAN, ROLES.DOCTOR],
  vaccination: [ROLES.ADMIN, ROLES.HEALTH_WORKER, ROLES.DOCTOR],
  village: [ROLES.ADMIN, ROLES.HEALTH_WORKER],
  disease: [ROLES.ADMIN, ROLES.DOCTOR],
  followUps: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.HEALTH_WORKER],
  dataQuality: [ROLES.ADMIN],
  audit: [ROLES.ADMIN],
  reports: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LAB_TECHNICIAN, ROLES.HEALTH_WORKER],
};

export const analyticsPermissionService = {
  assertAccess(actor, key) {
    const allowed = permissions[key] || [];
    if (!allowed.includes(actor?.role)) {
      const error = new Error("Access denied");
      error.statusCode = 403;
      throw error;
    }
  },

  canViewSensitiveDetails(actor) {
    return [ROLES.ADMIN, ROLES.DOCTOR].includes(actor?.role);
  },
};
