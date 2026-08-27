import { analyticsPermissionService } from "./analytics-permission.service.js";

const reportDefinitions = {
  patients: {
    fields: ["patientId", "fullName", "gender", "age", "bloodGroup", "status", "createdAt", "village"],
    sensitiveFields: ["fullName"],
  },
  visits: {
    fields: ["visitId", "patientId", "doctorName", "diagnosis", "visitStatus", "visitDate", "followUpDate"],
    sensitiveFields: [],
  },
  appointments: {
    fields: ["appointmentNumber", "patientId", "doctorName", "department", "appointmentDate", "status", "priority", "bookingSource"],
    sensitiveFields: [],
  },
  queue: {
    fields: ["displayToken", "patientId", "doctorName", "department", "status", "priority", "queueDate", "estimatedWaitMinutes"],
    sensitiveFields: [],
  },
  prescriptions: {
    fields: ["prescriptionNumber", "patientId", "doctorName", "status", "issuedAt", "dispensedAt"],
    sensitiveFields: [],
  },
  pharmacy_stock: {
    fields: ["medicineName", "batchNumber", "availableQuantity", "expiryDate", "status", "supplierName"],
    sensitiveFields: [],
  },
  lab_requests: {
    fields: ["requestNumber", "patientId", "doctorName", "priority", "status", "requestedAt", "completedAt"],
    sensitiveFields: [],
  },
  lab_results: {
    fields: ["testName", "patientId", "criticalFlag", "verifiedAt", "doctorReviewedAt"],
    sensitiveFields: [],
  },
  vaccinations: {
    fields: ["certificateNumber", "patientId", "vaccineName", "doseNumber", "administeredDate", "nextDoseDate", "village"],
    sensitiveFields: [],
  },
  follow_ups: {
    fields: ["visitId", "patientId", "doctorName", "followUpDate", "visitStatus"],
    sensitiveFields: [],
  },
  audit_logs: {
    fields: ["createdAt", "actorId", "actorRole", "action", "resourceType", "resourceId", "ipAddress"],
    sensitiveFields: [],
  },
};

const templates = [
  { id: "daily-registrations", module: "patients", label: "Daily registrations", columns: ["patientId", "gender", "age", "createdAt", "village"] },
  { id: "patient-master-list", module: "patients", label: "Patient master list", columns: ["patientId", "fullName", "gender", "age", "bloodGroup", "status"] },
  { id: "daily-appointment-register", module: "appointments", label: "Daily appointment register", columns: ["appointmentNumber", "patientId", "doctorName", "appointmentDate", "status"] },
  { id: "daily-token-register", module: "queue", label: "Daily token register", columns: ["displayToken", "patientId", "doctorName", "status", "estimatedWaitMinutes"] },
  { id: "daily-dispensing-report", module: "prescriptions", label: "Daily dispensing report", columns: ["prescriptionNumber", "patientId", "doctorName", "status", "dispensedAt"] },
  { id: "daily-request-report", module: "lab_requests", label: "Daily lab request report", columns: ["requestNumber", "patientId", "priority", "status", "requestedAt"] },
  { id: "daily-vaccination-register", module: "vaccinations", label: "Daily vaccination register", columns: ["certificateNumber", "patientId", "vaccineName", "doseNumber", "administeredDate"] },
  { id: "audit-log-report", module: "audit_logs", label: "Audit log report", columns: ["createdAt", "actorRole", "action", "resourceType", "resourceId"] },
];

export const reportDefinitionService = {
  getDefinition(module) {
    const definition = reportDefinitions[module];
    if (!definition) {
      const error = new Error("Unsupported report module");
      error.statusCode = 400;
      throw error;
    }
    return definition;
  },

  filterAllowedColumns(module, requestedColumns, actor) {
    const definition = this.getDefinition(module);
    const allowed = requestedColumns.filter((field) => definition.fields.includes(field));
    if (analyticsPermissionService.canViewSensitiveDetails(actor)) {
      return allowed;
    }
    return allowed.filter((field) => !definition.sensitiveFields.includes(field));
  },

  listTemplates() {
    return templates;
  },
};
