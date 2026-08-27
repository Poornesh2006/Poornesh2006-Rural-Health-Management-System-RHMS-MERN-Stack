import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";
import { Patient } from "../models/patient.model.js";
import { VaccineBatch } from "../models/vaccine-batch.model.js";
import { Vaccine } from "../models/vaccine.model.js";
import { VaccinationRecord } from "../models/vaccination-record.model.js";
import { VaccinationSchedule } from "../models/vaccination-schedule.model.js";
import { StockMovement } from "../models/stock-movement.model.js";
import { vaccinationRepository } from "../repositories/vaccination.repository.js";
import {
  administerVaccinationSchema,
  adverseEventSchema,
  vaccineBatchSchema,
  vaccinePayloadSchema,
  vaccinationScheduleSchema,
} from "../validators/vaccination.validator.js";
import { calculateAge } from "../utils/health-metrics.js";
import { generateCertificateNumber, generateVaccineCode } from "../utils/id-generator.js";
import { auditService } from "./audit.service.js";
import { notificationService } from "./notification.service.js";
import { socketService } from "./socket.service.js";

function ensureRole(actor, roles) {
  if (!roles.includes(actor?.role)) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }
}

function isBatchUsable(batch) {
  return batch && batch.availableQuantity > 0 && !["expired", "quarantined", "recalled", "exhausted"].includes(batch.status) && new Date(batch.expiryDate) > new Date();
}

function calculateMonthsOld(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  return (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
}

export const vaccinationService = {
  async createVaccine(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.HEALTH_WORKER]);
    const parsed = vaccinePayloadSchema.parse(payload);
    const vaccine = await vaccinationRepository.createVaccine({
      ...parsed,
      vaccineCode: generateVaccineCode(),
    });
    await auditService.record({ actor, action: "vaccine_created", resourceType: "vaccine", resourceId: vaccine.vaccineCode });
    return vaccine;
  },

  async listVaccines(query) {
    return vaccinationRepository.listVaccines({ search: query.search || "" });
  },

  async updateVaccine(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.HEALTH_WORKER]);
    const parsed = vaccinePayloadSchema.partial().parse(payload);
    const vaccine = await vaccinationRepository.findVaccineById(id);
    if (!vaccine) {
      const error = new Error("Vaccine not found");
      error.statusCode = 404;
      throw error;
    }
    Object.assign(vaccine, parsed);
    await vaccine.save();
    return vaccine.toObject();
  },

  async deactivateVaccine(id, actor) {
    return this.updateVaccine(id, { activeStatus: false }, actor);
  },

  async receiveBatch(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.HEALTH_WORKER]);
    const parsed = vaccineBatchSchema.parse(payload);
    const vaccine = await Vaccine.findById(parsed.vaccineId);
    if (!vaccine) {
      const error = new Error("Vaccine not found");
      error.statusCode = 404;
      throw error;
    }
    const batch = await VaccineBatch.create({
      vaccineRef: vaccine._id,
      supplierRef: parsed.supplierId || null,
      batchNumber: parsed.batchNumber,
      manufactureDate: parsed.manufactureDate ? new Date(parsed.manufactureDate) : null,
      expiryDate: new Date(parsed.expiryDate),
      receivedQuantity: parsed.receivedQuantity,
      availableQuantity: parsed.receivedQuantity,
      storageLocation: parsed.storageLocation,
      coldChainStatus: parsed.coldChainStatus,
      receivedDate: parsed.receivedDate ? new Date(parsed.receivedDate) : new Date(),
      status: "active",
    });
    socketService.emit("vaccination:stock-updated", { vaccineId: String(vaccine._id), batchId: String(batch._id) }, ["role:health_worker"]);
    socketService.emit("analytics:vaccination-updated", { scope: "stock" }, ["role:admin", "role:health_worker"]);
    await auditService.record({ actor, action: "vaccine_stock_received", resourceType: "vaccine_batch", resourceId: batch.batchNumber });
    return batch.toObject();
  },

  async listBatches(vaccineId = "") {
    const batches = await vaccinationRepository.listBatches(vaccineId);
    return batches.filter((batch) => batch.status !== "expired");
  },

  async createSchedule(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.HEALTH_WORKER]);
    const parsed = vaccinationScheduleSchema.parse(payload);
    const schedule = await VaccinationSchedule.create({
      scheduleName: parsed.scheduleName,
      targetGroup: parsed.targetGroup,
      ageFrom: parsed.ageFrom,
      ageTo: parsed.ageTo,
      genderRestriction: parsed.genderRestriction,
      pregnancyRequirement: parsed.pregnancyRequirement,
      vaccineRef: parsed.vaccineId,
      doseNumber: parsed.doseNumber,
      minimumIntervalDays: parsed.minimumIntervalDays,
      recommendedIntervalDays: parsed.recommendedIntervalDays,
      nextDoseRules: parsed.nextDoseRules,
      activeStatus: parsed.activeStatus,
    });
    return schedule.toObject();
  },

  async listSchedules(query) {
    return vaccinationRepository.listSchedules(query.vaccineId || "");
  },

  async getPatientVaccinations(patientId) {
    const [history, due, overdue] = await Promise.all([
      vaccinationRepository.listPatientVaccinations(patientId),
      this.getDueVaccines(patientId, false),
      this.getDueVaccines(patientId, true),
    ]);
    return { history, due, overdue };
  },

  async getDueVaccines(patientId, overdueOnly = false) {
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }
    const history = await vaccinationRepository.listPatientVaccinations(patientId);
    const administeredByKey = new Set(history.map((record) => `${record.vaccineRef?._id || record.vaccineRef}:${record.doseNumber}`));
    const schedules = await VaccinationSchedule.find({ activeStatus: true }).populate("vaccineRef").lean();
    const monthsOld = calculateMonthsOld(patient.dateOfBirth);
    const now = new Date();

    return schedules
      .filter((schedule) => monthsOld >= schedule.ageFrom && monthsOld <= schedule.ageTo)
      .map((schedule) => {
        const key = `${schedule.vaccineRef?._id}:${schedule.doseNumber}`;
        const existingDose = history.find((record) => String(record.vaccineRef?._id || record.vaccineRef) === String(schedule.vaccineRef?._id) && record.doseNumber === schedule.doseNumber);
        const lastDose = history
          .filter((record) => String(record.vaccineRef?._id || record.vaccineRef) === String(schedule.vaccineRef?._id))
          .sort((a, b) => new Date(b.administeredDate) - new Date(a.administeredDate))[0];
        const dueDate = lastDose
          ? new Date(new Date(lastDose.administeredDate).getTime() + schedule.recommendedIntervalDays * 24 * 60 * 60 * 1000)
          : new Date(patient.dateOfBirth);
        return {
          scheduleId: schedule._id,
          vaccineId: schedule.vaccineRef?._id,
          vaccineName: schedule.vaccineRef?.vaccineName,
          doseNumber: schedule.doseNumber,
          dueDate,
          overdue: dueDate < now && !existingDose,
          completed: administeredByKey.has(key),
          guidance: schedule.nextDoseRules,
        };
      })
      .filter((item) => !item.completed && (overdueOnly ? item.overdue : true));
  },

  async administerVaccination(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.HEALTH_WORKER, ROLES.DOCTOR]);
    const parsed = administerVaccinationSchema.parse(payload);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const patient = await Patient.findOne({ patientId: parsed.patientId }).session(session);
      if (!patient) {
        const error = new Error("Patient not found");
        error.statusCode = 404;
        throw error;
      }

      const vaccine = await Vaccine.findById(parsed.vaccineId).session(session);
      const batch = await VaccineBatch.findById(parsed.batchId).session(session);
      if (!vaccine || !batch) {
        const error = new Error("Vaccine or batch not found");
        error.statusCode = 404;
        throw error;
      }
      if (!isBatchUsable(batch)) {
        const error = new Error("Selected vaccine batch is not valid for administration");
        error.statusCode = 400;
        throw error;
      }

      const existing = await VaccinationRecord.findOne({
        patientId: parsed.patientId,
        vaccineRef: vaccine._id,
        doseNumber: parsed.doseNumber,
      }).session(session);
      if (existing) {
        const error = new Error("This vaccine dose has already been recorded for the patient");
        error.statusCode = 409;
        throw error;
      }

      const schedule = parsed.scheduleId ? await VaccinationSchedule.findById(parsed.scheduleId).session(session) : null;
      if (schedule) {
        const previousDose = parsed.doseNumber > 1
          ? await VaccinationRecord.findOne({
              patientId: parsed.patientId,
              vaccineRef: vaccine._id,
              doseNumber: parsed.doseNumber - 1,
            }).session(session)
          : null;
        if (parsed.doseNumber > 1 && !previousDose) {
          const error = new Error("Previous vaccine dose is required before recording this dose");
          error.statusCode = 409;
          throw error;
        }
        if (previousDose && schedule.minimumIntervalDays > 0) {
          const minDate = new Date(new Date(previousDose.administeredDate).getTime() + schedule.minimumIntervalDays * 24 * 60 * 60 * 1000);
          const requestedDate = parsed.administeredDate ? new Date(parsed.administeredDate) : new Date();
          if (requestedDate < minDate) {
            const error = new Error("Minimum interval for the selected schedule has not been met");
            error.statusCode = 409;
            throw error;
          }
        }
      }

      const quantityBefore = batch.availableQuantity;
      batch.availableQuantity -= 1;
      batch.status = batch.availableQuantity <= 0 ? "exhausted" : "active";
      await batch.save({ session });

      const nextDoseDate = schedule?.recommendedIntervalDays
        ? new Date((parsed.administeredDate ? new Date(parsed.administeredDate) : new Date()).getTime() + schedule.recommendedIntervalDays * 24 * 60 * 60 * 1000)
        : null;

      const record = await VaccinationRecord.create([
        {
          patientId: parsed.patientId,
          patientRef: patient._id,
          vaccineRef: vaccine._id,
          batchRef: batch._id,
          doseNumber: parsed.doseNumber,
          administeredDate: parsed.administeredDate ? new Date(parsed.administeredDate) : new Date(),
          route: parsed.route,
          site: parsed.site,
          administeredBy: actor?.sub || null,
          facility: parsed.facility,
          adverseEventObserved: parsed.adverseEventObserved,
          adverseEventNotes: parsed.adverseEventNotes,
          nextDoseDate,
          scheduleReference: schedule?._id || null,
          certificateNumber: generateCertificateNumber(),
          notes: parsed.notes,
          village: patient.address?.village || "",
        },
      ], { session }).then((items) => items[0]);

      await StockMovement.create([
        {
          medicineRef: vaccine._id,
          batchRef: batch._id,
          movementType: "dispensing",
          quantity: -1,
          quantityBefore,
          quantityAfter: batch.availableQuantity,
          referenceType: "vaccination",
          referenceId: record.certificateNumber,
          reason: `Vaccination for ${patient.patientId}`,
          performedBy: actor?.sub || null,
        },
      ], { session });

      await session.commitTransaction();

      await notificationService.create({
        title: "Vaccination administered",
        description: `${vaccine.vaccineName} dose ${record.doseNumber} recorded for ${patient.patientId}`,
        audienceRole: ROLES.HEALTH_WORKER,
        entityType: "vaccination",
        entityId: record.certificateNumber,
      });
      socketService.emit("vaccination:administered", { patientId: patient.patientId, vaccineName: vaccine.vaccineName }, ["role:health_worker"]);
      socketService.emit("vaccination:stock-updated", { vaccineId: String(vaccine._id), batchId: String(batch._id) }, ["role:health_worker"]);
      socketService.emit("analytics:vaccination-updated", { scope: "administration" }, ["role:admin", "role:health_worker", "role:doctor"]);
      await auditService.record({ actor, action: "vaccination_administered", resourceType: "vaccination", resourceId: record.certificateNumber });
      return record.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async recordAdverseEvent(recordId, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.HEALTH_WORKER, ROLES.DOCTOR]);
    const parsed = adverseEventSchema.parse(payload);
    const record = await VaccinationRecord.findById(recordId);
    if (!record) {
      const error = new Error("Vaccination record not found");
      error.statusCode = 404;
      throw error;
    }
    record.adverseEventObserved = true;
    record.adverseEventRecord = {
      ...parsed,
      recordedBy: actor?.sub || null,
    };
    await record.save();
    await auditService.record({ actor, action: "adverse_event_recorded", resourceType: "vaccination", resourceId: record.certificateNumber });
    return record.toObject();
  },

  async getCoverageStatistics() {
    const records = await VaccinationRecord.find().lean();
    const byVillage = records.reduce((accumulator, record) => {
      const key = record.village || "Unknown";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});
    return {
      totalAdministrations: records.length,
      byVillage,
      administeredToday: records.filter((record) => {
        const date = new Date(record.administeredDate);
        const today = new Date();
        return date.toDateString() === today.toDateString();
      }).length,
    };
  },

  async getAlerts() {
    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    const batches = await vaccinationRepository.listBatches();
    return batches.filter((batch) => new Date(batch.expiryDate) <= in30 || batch.availableQuantity <= 5).map((batch) => ({
      ...batch,
      risk: new Date(batch.expiryDate) <= now ? "expired" : new Date(batch.expiryDate) <= in30 ? "expiring_30_days" : "low_stock",
    }));
  },
};
