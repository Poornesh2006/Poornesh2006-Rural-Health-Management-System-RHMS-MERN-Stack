import { Appointment } from "../models/appointment.model.js";
import { Alert } from "../models/alert.model.js";
import { DocumentVerification } from "../models/document-verification.model.js";
import { FollowUpTask } from "../models/follow-up-task.model.js";
import { Household } from "../models/household.model.js";
import { LabResult } from "../models/lab-result.model.js";
import { MedicineBatch } from "../models/medicine-batch.model.js";
import { Patient } from "../models/patient.model.js";
import { ShiftHandover } from "../models/shift-handover.model.js";
import { User } from "../models/user.model.js";
import {
  createAlertSchema,
  createDocumentVerificationSchema,
  createFollowUpTaskSchema,
  createShiftHandoverSchema,
  duplicateCheckSchema,
  searchSchema,
  updateFollowUpTaskSchema,
  updateShiftHandoverSchema,
} from "../validators/operations.validator.js";
import { generateAuditId } from "../utils/id-generator.js";

function scoreMatch({ patient, query }) {
  let score = 0;
  const matchingFields = [];
  const conflictingFields = [];
  const fullName = `${query.firstName} ${query.lastName}`.trim().toLowerCase();

  if (fullName && patient.fullName?.toLowerCase() === fullName) {
    score += 32;
    matchingFields.push("name");
  } else if (fullName) {
    conflictingFields.push("name");
  }
  if (query.phone && patient.phone === query.phone) {
    score += 25;
    matchingFields.push("phone");
  }
  if (query.dateOfBirth && patient.dateOfBirth && new Date(patient.dateOfBirth).toISOString().slice(0, 10) === query.dateOfBirth) {
    score += 18;
    matchingFields.push("dob");
  }
  if (query.village && patient.address?.village?.toLowerCase() === query.village.toLowerCase()) {
    score += 10;
    matchingFields.push("village");
  }
  if (query.guardianName && patient.guardianName?.toLowerCase() === query.guardianName.toLowerCase()) {
    score += 10;
    matchingFields.push("guardian");
  }
  if (query.gender && patient.gender === query.gender) {
    score += 5;
    matchingFields.push("gender");
  }

  return {
    matchPercentage: Math.min(100, score),
    matchingFields,
    conflictingFields,
  };
}

export const operationsService = {
  async detectDuplicatePatients(payload, tenant) {
    const query = duplicateCheckSchema.parse(payload);
    const fullName = `${query.firstName} ${query.lastName}`.trim();
    const candidates = await Patient.find({
      facilityRef: tenant.facilityId,
      deletedAt: null,
      $or: [
        ...(fullName ? [{ fullName: new RegExp(fullName, "i") }] : []),
        ...(query.phone ? [{ phone: query.phone }] : []),
        ...(query.village ? [{ "address.village": new RegExp(query.village, "i") }] : []),
        ...(query.guardianName ? [{ guardianName: new RegExp(query.guardianName, "i") }] : []),
      ],
    }).sort({ updatedAt: -1 }).limit(6).lean();

    return candidates
      .map((patient) => ({
        patientId: patient.patientId,
        fullName: patient.fullName,
        lastVisit: patient.updatedAt,
        ...scoreMatch({ patient, query }),
      }))
      .filter((item) => item.matchPercentage >= 20)
      .sort((left, right) => right.matchPercentage - left.matchPercentage);
  },

  async listFollowUpTasks(tenant) {
    return FollowUpTask.find({ facilityRef: tenant.facilityId }).sort({ dueDate: 1 }).lean();
  },

  async createFollowUpTask(payload, actor, tenant) {
    const parsed = createFollowUpTaskSchema.parse(payload);
    const task = await FollowUpTask.create({
      taskNumber: generateAuditId("FUP"),
      ...parsed,
      dueDate: new Date(parsed.dueDate),
      organizationRef: tenant.organizationId,
      facilityRef: tenant.facilityId,
      createdBy: actor.sub,
      updatedBy: actor.sub,
    });
    return task.toObject();
  },

  async updateFollowUpTask(taskNumber, payload, actor, tenant) {
    const parsed = updateFollowUpTaskSchema.parse(payload);
    const task = await FollowUpTask.findOne({ taskNumber, facilityRef: tenant.facilityId });
    if (!task) {
      const error = new Error("Follow-up task not found");
      error.statusCode = 404;
      throw error;
    }

    Object.assign(task, parsed, { updatedBy: actor.sub });
    if (parsed.dueDate) {
      task.dueDate = new Date(parsed.dueDate);
    }
    if (parsed.lastContact) {
      task.lastContactAt = new Date();
    }

    await task.save();
    return task.toObject();
  },

  async listShiftHandovers(tenant) {
    return ShiftHandover.find({ facilityRef: tenant.facilityId }).sort({ createdAt: -1 }).lean();
  },

  async createShiftHandover(payload, actor, tenant) {
    const parsed = createShiftHandoverSchema.parse(payload);
    const handover = await ShiftHandover.create({
      handoverNumber: generateAuditId("HND"),
      ...parsed,
      dueTime: parsed.dueTime ? new Date(parsed.dueTime) : null,
      outgoingStaffRef: actor.sub,
      outgoingStaffName: actor.fullName || actor.email || actor.sub,
      organizationRef: tenant.organizationId,
      facilityRef: tenant.facilityId,
      createdBy: actor.sub,
      updatedBy: actor.sub,
    });
    return handover.toObject();
  },

  async updateShiftHandover(handoverNumber, payload, actor, tenant) {
    const parsed = updateShiftHandoverSchema.parse(payload);
    const handover = await ShiftHandover.findOne({ handoverNumber, facilityRef: tenant.facilityId });
    if (!handover) {
      const error = new Error("Shift handover not found");
      error.statusCode = 404;
      throw error;
    }

    if (parsed.comment) {
      handover.comments.push({
        authorRef: actor.sub,
        authorName: actor.fullName || actor.email || actor.sub,
        message: parsed.comment,
      });
    }

    if (parsed.status) {
      handover.status = parsed.status;
      if (parsed.status === "acknowledged") {
        handover.acknowledgedAt = new Date();
      }
      if (parsed.status === "resolved") {
        handover.resolvedAt = new Date();
      }
    }

    handover.updatedBy = actor.sub;
    await handover.save();
    return handover.toObject();
  },

  async listAlerts(tenant) {
    const now = new Date();
    const overdueFollowUps = await FollowUpTask.countDocuments({
      facilityRef: tenant.facilityId,
      dueDate: { $lt: now },
      status: { $nin: ["completed", "resolved"] },
    });
    const criticalLabs = await LabResult.countDocuments({ facilityRef: tenant.facilityId, criticalFlag: true });
    const lowStock = await MedicineBatch.countDocuments({ facilityRef: tenant.facilityId, status: "low_stock" });
    const savedAlerts = await Alert.find({ facilityRef: tenant.facilityId }).sort({ createdAt: -1 }).limit(10).lean();

    const derived = [
      overdueFollowUps
        ? {
            alertNumber: "DERIVED-FOLLOWUP",
            category: "overdue_follow_up",
            severity: "high",
            title: "Overdue follow-ups need review",
            description: `${overdueFollowUps} follow-up tasks are overdue.`,
            status: "open",
          }
        : null,
      criticalLabs
        ? {
            alertNumber: "DERIVED-LAB",
            category: "lab_critical",
            severity: "critical",
            title: "Critical lab results pending review",
            description: `${criticalLabs} critical lab results require attention.`,
            status: "open",
          }
        : null,
      lowStock
        ? {
            alertNumber: "DERIVED-STOCK",
            category: "low_medicine_stock",
            severity: "medium",
            title: "Medicine stock alerts",
            description: `${lowStock} medicine batches are below threshold.`,
            status: "open",
          }
        : null,
    ].filter(Boolean);

    return [...derived, ...savedAlerts];
  },

  async createAlert(payload, actor, tenant) {
    const parsed = createAlertSchema.parse(payload);
    const alert = await Alert.create({
      alertNumber: generateAuditId("ALT"),
      ...parsed,
      organizationRef: tenant.organizationId,
      facilityRef: tenant.facilityId,
      createdBy: actor.sub,
      updatedBy: actor.sub,
    });
    return alert.toObject();
  },

  async updateAlert(alertNumber, status, actor, tenant) {
    const alert = await Alert.findOne({ alertNumber, facilityRef: tenant.facilityId });
    if (!alert) {
      const error = new Error("Alert not found");
      error.statusCode = 404;
      throw error;
    }

    alert.status = status;
    if (status === "acknowledged") {
      alert.acknowledgedAt = new Date();
    }
    if (status === "resolved") {
      alert.resolvedAt = new Date();
    }
    alert.updatedBy = actor.sub;
    await alert.save();
    return alert.toObject();
  },

  async getDataQualitySummary(tenant) {
    const patients = await Patient.find({ facilityRef: tenant.facilityId, deletedAt: null }).lean();
    const appointments = await Appointment.find({ facilityRef: tenant.facilityId }).lean();
    const issues = [];

    for (const patient of patients.slice(0, 40)) {
      if (!patient.phone) {
        issues.push({ severity: "medium", module: "patients", record: patient.patientId, problem: "Missing phone number", suggestedAction: "Update patient contact details" });
      }
      if (!patient.dateOfBirth && !patient.age) {
        issues.push({ severity: "medium", module: "patients", record: patient.patientId, problem: "Missing DOB or age", suggestedAction: "Confirm date of birth at next visit" });
      }
      if (!patient.address?.village) {
        issues.push({ severity: "low", module: "patients", record: patient.patientId, problem: "Missing village", suggestedAction: "Complete address capture" });
      }
      if (!patient.emergencyContact) {
        issues.push({ severity: "low", module: "patients", record: patient.patientId, problem: "Missing emergency contact", suggestedAction: "Add emergency contact information" });
      }
    }

    for (const appointment of appointments.slice(0, 25)) {
      if (!appointment.patientId) {
        issues.push({ severity: "high", module: "appointments", record: appointment.appointmentNumber || String(appointment._id), problem: "Appointment without patient", suggestedAction: "Review appointment linkage" });
      }
    }

    return issues;
  },

  async createDocumentVerification(payload, actor, tenant) {
    const parsed = createDocumentVerificationSchema.parse(payload);
    const verification = await DocumentVerification.create({
      verificationCode: generateAuditId("DOC"),
      publicToken: generateAuditId("VFY").toLowerCase(),
      ...parsed,
      issueDate: parsed.issueDate ? new Date(parsed.issueDate) : new Date(),
      organizationRef: tenant.organizationId,
      facilityRef: tenant.facilityId,
      createdBy: actor.sub,
    });
    return verification.toObject();
  },

  async verifyDocument(publicToken) {
    const document = await DocumentVerification.findOne({ publicToken }).lean();
    if (!document) {
      return {
        valid: false,
        status: "invalid",
        documentType: "unknown",
        documentNumber: "",
        issuingFacility: "",
        issueDate: "",
        patientMaskedIdentifier: "",
      };
    }

    return {
      valid: document.status === "valid",
      status: document.status,
      documentType: document.documentType,
      documentNumber: document.documentNumber,
      issuingFacility: document.issuingFacility,
      issueDate: document.issueDate,
      patientMaskedIdentifier: document.patientMaskedIdentifier,
    };
  },

  async globalSearch(query, tenant) {
    const parsed = searchSchema.parse(query);
    const regex = new RegExp(parsed.q, "i");
    const [patients, households, appointments, users] = await Promise.all([
      Patient.find({ facilityRef: tenant.facilityId, $or: [{ fullName: regex }, { patientId: regex }, { phone: regex }, { "address.village": regex }] }).limit(5).lean(),
      Household.find({ facilityRef: tenant.facilityId, $or: [{ familyName: regex }, { village: regex }, { householdId: regex }] }).limit(5).lean(),
      Appointment.find({ facilityRef: tenant.facilityId, $or: [{ appointmentNumber: regex }, { patientId: regex }, { doctorName: regex }] }).limit(5).lean(),
      User.find({ activeFacilityRef: tenant.facilityId, $or: [{ fullName: regex }, { email: regex }], isActive: true }).limit(5).lean(),
    ]);

    return {
      patients: patients.map((item) => ({ id: item.patientId, title: item.fullName, subtitle: item.address?.village || "Village pending", route: `/patients/${item.patientId}` })),
      households: households.map((item) => ({ id: item.householdId, title: item.familyName, subtitle: item.village, route: `/operations/households#${item.householdId}` })),
      appointments: appointments.map((item) => ({ id: item.appointmentNumber, title: item.appointmentNumber, subtitle: `${item.patientId} | ${item.doctorName || item.department}`, route: "/appointments" })),
      users: users.map((item) => ({ id: String(item._id), title: item.fullName, subtitle: item.role, route: "/settings" })),
    };
  },
};
