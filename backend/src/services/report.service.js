import { Appointment } from "../models/appointment.model.js";
import { AuditLog } from "../models/audit-log.model.js";
import { LabRequest } from "../models/lab-request.model.js";
import { LabResult } from "../models/lab-result.model.js";
import { MedicineBatch } from "../models/medicine-batch.model.js";
import { Patient } from "../models/patient.model.js";
import { Prescription } from "../models/prescription.model.js";
import { QueueEntry } from "../models/queue-entry.model.js";
import { SavedReport } from "../models/saved-report.model.js";
import { VaccinationRecord } from "../models/vaccination-record.model.js";
import { Visit } from "../models/visit.model.js";
import { analyticsFilterService } from "./analytics-filter.service.js";
import { analyticsPermissionService } from "./analytics-permission.service.js";
import { auditService } from "./audit.service.js";
import { exportService } from "./export.service.js";
import { reportDefinitionService } from "./report-definition.service.js";
import { reportExportSchema, reportPreviewSchema, savedReportSchema } from "../validators/analytics.validator.js";

const modelMap = {
  patients: Patient,
  visits: Visit,
  appointments: Appointment,
  queue: QueueEntry,
  prescriptions: Prescription,
  pharmacy_stock: MedicineBatch,
  lab_requests: LabRequest,
  lab_results: LabResult,
  vaccinations: VaccinationRecord,
  follow_ups: Visit,
  audit_logs: AuditLog,
};

function buildQuery(module, filters) {
  switch (module) {
    case "patients":
      return {
        createdAt: { $gte: filters.from, $lt: filters.to },
        ...(filters.gender ? { gender: filters.gender } : {}),
        ...(filters.village ? { "address.village": filters.village } : {}),
      };
    case "visits":
    case "follow_ups":
      return {
        visitDate: { $gte: filters.from, $lt: filters.to },
        ...(module === "follow_ups" ? { followUpDate: { $gte: filters.from, $lt: filters.to } } : {}),
        ...(filters.doctorId ? { doctorRef: filters.doctorId } : {}),
      };
    case "appointments":
      return {
        appointmentDate: { $gte: filters.from, $lt: filters.to },
        ...(filters.doctorId ? { doctorRef: filters.doctorId } : {}),
        ...(filters.department ? { department: filters.department } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      };
    case "queue":
      return {
        queueDate: { $gte: filters.from, $lt: filters.to },
        ...(filters.department ? { department: filters.department } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      };
    case "prescriptions":
      return { issuedAt: { $gte: filters.from, $lt: filters.to } };
    case "pharmacy_stock":
      return {};
    case "lab_requests":
      return { requestedAt: { $gte: filters.from, $lt: filters.to }, ...(filters.status ? { status: filters.status } : {}) };
    case "lab_results":
      return { createdAt: { $gte: filters.from, $lt: filters.to } };
    case "vaccinations":
      return { administeredDate: { $gte: filters.from, $lt: filters.to }, ...(filters.village ? { village: filters.village } : {}) };
    case "audit_logs":
      return { createdAt: { $gte: filters.from, $lt: filters.to } };
    default:
      return {};
  }
}

async function projectRows(module, rows) {
  if (module === "pharmacy_stock") {
    return rows.map((row) => ({
      medicineName: row.medicineRef?.genericName || "Unknown",
      batchNumber: row.batchNumber,
      availableQuantity: row.availableQuantity,
      expiryDate: row.expiryDate,
      status: row.status,
      supplierName: row.supplierRef?.name || "",
    }));
  }
  if (module === "vaccinations") {
    return rows.map((row) => ({
      certificateNumber: row.certificateNumber,
      patientId: row.patientId,
      vaccineName: row.vaccineRef?.vaccineName || "Unknown",
      doseNumber: row.doseNumber,
      administeredDate: row.administeredDate,
      nextDoseDate: row.nextDoseDate,
      village: row.village,
    }));
  }
  return rows.map((row) => ({
    ...row,
    village: row.address?.village || row.village || "",
  }));
}

export const reportService = {
  async previewReport(query, actor) {
    analyticsPermissionService.assertAccess(actor, "reports");
    const parsed = reportPreviewSchema.parse(query);
    const filters = analyticsFilterService.parse(query);
    const columns = reportDefinitionService.filterAllowedColumns(parsed.module, parsed.fields, actor);
    const Model = modelMap[parsed.module];
    const rows = await Model.find(buildQuery(parsed.module, filters))
      .sort(parsed.sortingField ? { [parsed.sortingField]: parsed.sortingDirection === "asc" ? 1 : -1 } : { createdAt: -1 })
      .limit(filters.limit)
      .populate(parsed.module === "pharmacy_stock" ? ["medicineRef", "supplierRef"] : parsed.module === "vaccinations" ? ["vaccineRef"] : [])
      .lean();
    const projected = await projectRows(parsed.module, rows);

    const result = {
      module: parsed.module,
      columns,
      rows: projected.map((row) => Object.fromEntries(columns.map((column) => [column, row[column] ?? ""]))),
      grouping: parsed.grouping,
      chartType: parsed.chartType,
      filters,
    };

    await auditService.record({
      actor,
      action: "report_viewed",
      resourceType: "report",
      resourceId: parsed.module,
      metadata: { fields: columns, filters },
    });

    return result;
  },

  async exportReport(query, actor) {
    analyticsPermissionService.assertAccess(actor, "reports");
    const parsed = reportExportSchema.parse(query);
    const preview = await this.previewReport(parsed, actor);
    let buffer;
    let contentType;
    let filename;

    if (parsed.exportFormat === "pdf") {
      buffer = await exportService.buildPdf({
        title: parsed.reportTitle,
        generatedBy: actor?.email || actor?.sub || "system",
        filters: preview.filters,
        columns: preview.columns,
        rows: preview.rows,
      });
      contentType = "application/pdf";
      filename = `${parsed.module}-report.pdf`;
    } else if (parsed.exportFormat === "xlsx") {
      buffer = await exportService.buildXlsx({
        title: parsed.reportTitle,
        sheetName: parsed.module,
        columns: preview.columns,
        rows: preview.rows,
        filters: preview.filters,
      });
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      filename = `${parsed.module}-report.xlsx`;
    } else {
      buffer = await exportService.buildCsv({
        columns: preview.columns,
        rows: preview.rows,
      });
      contentType = "text/csv";
      filename = `${parsed.module}-report.csv`;
    }

    await auditService.record({
      actor,
      action: "report_exported",
      resourceType: "report",
      resourceId: parsed.module,
      metadata: { exportFormat: parsed.exportFormat, filters: preview.filters },
    });

    return { buffer, contentType, filename };
  },

  async saveReport(payload, actor) {
    analyticsPermissionService.assertAccess(actor, "reports");
    const parsed = savedReportSchema.parse(payload);
    const saved = await SavedReport.create({
      ...parsed,
      ownerId: actor?.sub || "",
      ownerRole: actor?.role || "",
    });
    await auditService.record({ actor, action: "custom_report_created", resourceType: "saved_report", resourceId: String(saved._id) });
    return saved.toObject();
  },

  async listSavedReports(actor) {
    analyticsPermissionService.assertAccess(actor, "reports");
    return SavedReport.find({
      $or: [
        { ownerId: actor?.sub || "" },
        { visibility: "organization" },
        { visibility: "role", ownerRole: actor?.role || "" },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();
  },

  async updateSavedReport(id, payload, actor) {
    analyticsPermissionService.assertAccess(actor, "reports");
    const parsed = savedReportSchema.partial().parse(payload);
    const saved = await SavedReport.findById(id);
    if (!saved) {
      const error = new Error("Saved report not found");
      error.statusCode = 404;
      throw error;
    }
    if (saved.ownerId !== (actor?.sub || "") && actor?.role !== "admin") {
      const error = new Error("Access denied");
      error.statusCode = 403;
      throw error;
    }
    Object.assign(saved, parsed);
    await saved.save();
    return saved.toObject();
  },

  async deleteSavedReport(id, actor) {
    analyticsPermissionService.assertAccess(actor, "reports");
    const saved = await SavedReport.findById(id);
    if (!saved) {
      const error = new Error("Saved report not found");
      error.statusCode = 404;
      throw error;
    }
    if (saved.ownerId !== (actor?.sub || "") && actor?.role !== "admin") {
      const error = new Error("Access denied");
      error.statusCode = 403;
      throw error;
    }
    await saved.deleteOne();
    return { success: true };
  },

  listTemplates() {
    return reportDefinitionService.listTemplates();
  },
};
