import mongoose from "mongoose";
import { analyticsFilterService } from "./analytics-filter.service.js";
import { analyticsPermissionService } from "./analytics-permission.service.js";
import { cacheService } from "./cache.service.js";
import { Appointment } from "../models/appointment.model.js";
import { AuditLog } from "../models/audit-log.model.js";
import { LabRequest } from "../models/lab-request.model.js";
import { LabResult } from "../models/lab-result.model.js";
import { MedicineBatch } from "../models/medicine-batch.model.js";
import { Patient } from "../models/patient.model.js";
import { Prescription } from "../models/prescription.model.js";
import { QueueEntry } from "../models/queue-entry.model.js";
import { User } from "../models/user.model.js";
import { VaccineBatch } from "../models/vaccine-batch.model.js";
import { VaccinationRecord } from "../models/vaccination-record.model.js";
import { Visit } from "../models/visit.model.js";

function clampCount(value, threshold = 5) {
  return value > 0 && value < threshold ? "<5" : value;
}

function groupCounts(items, keyBuilder) {
  return items.reduce((accumulator, item) => {
    const key = keyBuilder(item);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function trendFromCounts(items, dateKey) {
  const grouped = items.reduce((accumulator, item) => {
    const key = new Date(item[dateKey]).toISOString().slice(0, 10);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function compareCounts(currentValue, previousValue) {
  if (!previousValue) {
    return { previousValue, percentageChange: null };
  }
  return {
    previousValue,
    percentageChange: Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1)),
  };
}

export const analyticsService = {
  async getExecutiveSummary(query, actor) {
    analyticsPermissionService.assertAccess(actor, "executive");
    const filters = analyticsFilterService.parse(query);
    const cacheKey = ["analytics", "executive", actor.role, JSON.stringify(filters)];
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const previous = filters.previousPeriod;
    const currentMatch = { $gte: filters.from, $lt: filters.to };
    const previousMatch = previous ? { $gte: previous.from, $lt: previous.to } : null;

    const [
      totalPatients,
      newPatients,
      visits,
      appointments,
      waiting,
      completedConsultations,
      emergencyCases,
      dispensed,
      labCompleted,
      vaccinations,
      followUpsDue,
      lowMedicineBatches,
      expiringMedicine,
      expiringVaccines,
      criticalLabs,
      activeDoctors,
      activeStaff,
      previousNewPatients,
      previousVisits,
    ] = await Promise.all([
      Patient.countDocuments({ deletedAt: null }),
      Patient.countDocuments({ createdAt: currentMatch, deletedAt: null }),
      Visit.countDocuments({ visitDate: currentMatch }),
      Appointment.countDocuments({ appointmentDate: currentMatch }),
      QueueEntry.countDocuments({ queueDate: currentMatch, status: { $in: ["waiting", "called", "skipped"] } }),
      QueueEntry.countDocuments({ queueDate: currentMatch, status: "completed" }),
      QueueEntry.countDocuments({ queueDate: currentMatch, priority: "emergency", status: { $nin: ["cancelled", "completed", "no_show"] } }),
      Prescription.countDocuments({ dispensedAt: currentMatch }),
      LabRequest.countDocuments({ completedAt: currentMatch }),
      VaccinationRecord.countDocuments({ administeredDate: currentMatch }),
      Visit.countDocuments({ followUpDate: currentMatch, visitStatus: "follow_up_due" }),
      MedicineBatch.countDocuments({ status: "low_stock" }),
      MedicineBatch.countDocuments({ expiryDate: { $gte: filters.from, $lt: filters.to } }),
      VaccineBatch.countDocuments({ expiryDate: { $gte: filters.from, $lt: filters.to } }),
      LabResult.countDocuments({ criticalFlag: true, updatedAt: currentMatch }),
      User.countDocuments({ role: "doctor", status: { $ne: "inactive" } }),
      User.countDocuments({ status: { $ne: "inactive" } }),
      previousMatch ? Patient.countDocuments({ createdAt: previousMatch, deletedAt: null }) : 0,
      previousMatch ? Visit.countDocuments({ visitDate: previousMatch }) : 0,
    ]);

    const result = {
      metrics: [
        { key: "totalPatients", label: "Total registered patients", value: totalPatients, comparison: compareCounts(newPatients, previousNewPatients) },
        { key: "newPatients", label: "New patients", value: newPatients, comparison: compareCounts(newPatients, previousNewPatients) },
        { key: "visits", label: "Total visits", value: visits, comparison: compareCounts(visits, previousVisits) },
        { key: "appointments", label: "Appointments", value: appointments },
        { key: "waiting", label: "Currently waiting", value: waiting },
        { key: "consultations", label: "Consultations completed", value: completedConsultations },
        { key: "dispensed", label: "Prescriptions dispensed", value: dispensed },
        { key: "labCompleted", label: "Lab tests completed", value: labCompleted },
        { key: "vaccinations", label: "Vaccinations administered", value: vaccinations },
        { key: "followUpsDue", label: "Follow-ups due", value: followUpsDue },
        { key: "criticalLabs", label: "Critical lab alerts", value: criticalLabs },
        { key: "activeDoctors", label: "Active doctors", value: activeDoctors },
      ],
      operations: {
        emergencyCases,
        lowMedicineBatches,
        expiringMedicine,
        expiringVaccines,
        activeStaff,
      },
      filters,
      lastUpdatedAt: new Date().toISOString(),
    };
    return cacheService.set(cacheKey, result, 60_000);
  },

  async getPatientAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "patients");
    const filters = analyticsFilterService.parse(query);
    const patients = await Patient.find({
      deletedAt: null,
      createdAt: { $gte: filters.from, $lt: filters.to },
      ...(filters.gender ? { gender: filters.gender } : {}),
      ...(filters.village ? { "address.village": filters.village } : {}),
    }).lean();
    const allVisits = await Visit.find({ visitDate: { $gte: filters.from, $lt: filters.to } }).lean();

    const ageDistribution = groupCounts(patients, (patient) => filters.ageToGroup(patient.age));
    const villageDistribution = groupCounts(patients, (patient) => patient.address?.village || "Unknown");
    const chronic = groupCounts(
      patients.flatMap((patient) => patient.medicalFlags?.chronicDiseases || []).map((name) => ({ name })),
      (item) => item.name || "Unknown",
    );

    const visitCountByPatient = groupCounts(allVisits, (visit) => visit.patientId);
    const highFrequencyVisitors = Object.entries(visitCountByPatient)
      .filter(([, count]) => count >= 3)
      .map(([patientId, count]) => ({ patientId, count }));

    return {
      totals: {
        registrations: patients.length,
        archived: await Patient.countDocuments({ status: "archived" }),
        repeatVisitRate: allVisits.length ? Number((Object.keys(visitCountByPatient).length / allVisits.length).toFixed(2)) : 0,
        averageVisitsPerPatient: patients.length ? Number((allVisits.length / Math.max(patients.length, 1)).toFixed(2)) : 0,
        overdueFollowUps: await Visit.countDocuments({ followUpDate: { $lt: new Date() }, visitStatus: "follow_up_due" }),
        incompleteDemographics: await Patient.countDocuments({ $or: [{ dateOfBirth: null }, { "address.village": "" }] }),
        missingEmergencyContact: await Patient.countDocuments({ emergencyContact: "" }),
      },
      trends: {
        registrations: trendFromCounts(patients, "createdAt"),
      },
      distributions: {
        gender: groupCounts(patients, (patient) => patient.gender || "unknown"),
        ageGroup: ageDistribution,
        bloodGroup: groupCounts(patients, (patient) => patient.bloodGroup || "Unknown"),
        village: Object.fromEntries(Object.entries(villageDistribution).map(([key, value]) => [key, clampCount(value)])),
        chronicDiseases: chronic,
      },
      drilldowns: {
        highFrequencyVisitors,
      },
      filters,
    };
  },

  async getAppointmentAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "appointments");
    const filters = analyticsFilterService.parse(query);
    const appointments = await Appointment.find({
      appointmentDate: { $gte: filters.from, $lt: filters.to },
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.doctorId ? { doctorRef: filters.doctorId } : {}),
    }).lean();

    const waitingStatuses = ["scheduled", "confirmed", "checked_in", "waiting", "called", "in_consultation"];
    const completed = appointments.filter((appointment) => appointment.status === "completed").length;
    const noShows = appointments.filter((appointment) => appointment.status === "missed").length;

    return {
      totals: {
        total: appointments.length,
        walkIns: appointments.filter((item) => ["walk_in", "online"].includes(item.bookingSource)).length,
        scheduled: appointments.filter((item) => item.bookingSource !== "walk_in").length,
        completionRate: appointments.length ? Number(((completed / appointments.length) * 100).toFixed(1)) : 0,
        noShowRate: appointments.length ? Number(((noShows / appointments.length) * 100).toFixed(1)) : 0,
        checkInConversionRate: appointments.length
          ? Number(((appointments.filter((item) => waitingStatuses.includes(item.status)).length / appointments.length) * 100).toFixed(1))
          : 0,
      },
      trends: {
        byDay: trendFromCounts(appointments, "appointmentDate"),
      },
      distributions: {
        byDoctor: groupCounts(appointments, (item) => item.doctorName || "Unassigned"),
        byDepartment: groupCounts(appointments, (item) => item.department || "Unknown"),
        byStatus: groupCounts(appointments, (item) => item.status || "unknown"),
        byBookingSource: groupCounts(appointments, (item) => item.bookingSource || "unknown"),
      },
      filters,
    };
  },

  async getQueueAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "queue");
    const filters = analyticsFilterService.parse(query);
    const queue = await QueueEntry.find({
      queueDate: { $gte: filters.from, $lt: filters.to },
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.doctorId ? { doctorRef: filters.doctorId } : {}),
    }).lean();

    const durations = queue
      .filter((entry) => entry.checkedInAt && entry.completedAt)
      .map((entry) => Math.round((new Date(entry.completedAt) - new Date(entry.checkedInAt)) / 60000));
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const median = sortedDurations.length ? sortedDurations[Math.floor(sortedDurations.length / 2)] : 0;

    return {
      totals: {
        averageWaitingTime: durations.length ? Number((durations.reduce((sum, value) => sum + value, 0) / durations.length).toFixed(1)) : 0,
        medianWaitingTime: median,
        maximumWaitingTime: durations.length ? Math.max(...durations) : 0,
        emergencyCount: queue.filter((entry) => entry.priority === "emergency").length,
        skippedCount: queue.filter((entry) => entry.status === "skipped").length,
        noShowCount: queue.filter((entry) => entry.status === "no_show").length,
        completionRate: queue.length ? Number(((queue.filter((entry) => entry.status === "completed").length / queue.length) * 100).toFixed(1)) : 0,
      },
      trends: {
        byHour: groupCounts(queue, (entry) => new Date(entry.queueDate).getHours().toString().padStart(2, "0")),
      },
      distributions: {
        waitingByDoctor: groupCounts(queue, (entry) => entry.doctorName || "Unassigned"),
        waitingByDepartment: groupCounts(queue, (entry) => entry.department || "Unknown"),
      },
      filters,
    };
  },

  async getDoctorAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "doctors");
    const filters = analyticsFilterService.parse(query);
    const visits = await Visit.find({
      visitDate: { $gte: filters.from, $lt: filters.to },
      ...(actor.role === "doctor" ? { doctorRef: new mongoose.Types.ObjectId(actor.sub) } : {}),
      ...(filters.doctorId ? { doctorRef: filters.doctorId } : {}),
    }).lean();
    const appointments = await Appointment.find({
      appointmentDate: { $gte: filters.from, $lt: filters.to },
      ...(actor.role === "doctor" ? { doctorRef: actor.sub } : {}),
      ...(filters.doctorId ? { doctorRef: filters.doctorId } : {}),
    }).lean();

    const byDoctor = groupCounts(visits, (visit) => visit.doctorName || "Unassigned");
    return {
      totals: {
        consultations: visits.length,
        completed: visits.filter((visit) => ["completed", "follow_up_due"].includes(visit.visitStatus)).length,
        followUpsScheduled: visits.filter((visit) => visit.followUpDate).length,
        prescriptionsCreated: visits.filter((visit) => visit.prescription?.length).length,
        labRequestsCreated: visits.filter((visit) => visit.labRequests?.length).length,
      },
      trends: {
        workload: trendFromCounts(visits, "visitDate"),
      },
      distributions: {
        byDoctor,
        assignedVsCompleted: Object.entries(groupCounts(appointments, (item) => item.doctorName || "Unassigned")).map(([doctor, assigned]) => ({
          doctor,
          assigned,
          completed: visits.filter((visit) => (visit.doctorName || "Unassigned") === doctor).length,
        })),
      },
      filters,
    };
  },

  async getPharmacyAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "pharmacy");
    const filters = analyticsFilterService.parse(query);
    const prescriptions = await Prescription.find({
      issuedAt: { $gte: filters.from, $lt: filters.to },
    }).lean();
    const batches = await MedicineBatch.find().populate("medicineRef").lean();

    return {
      totals: {
        pending: prescriptions.filter((item) => ["created", "pending_pharmacy", "partially_dispensed"].includes(item.status)).length,
        fullyDispensed: prescriptions.filter((item) => item.status === "fully_dispensed").length,
        partial: prescriptions.filter((item) => item.status === "partially_dispensed").length,
        outOfStockItems: prescriptions.flatMap((item) => item.items || []).filter((item) => item.status === "out_of_stock").length,
        lowStock: batches.filter((batch) => batch.status === "low_stock").length,
        expired: batches.filter((batch) => batch.status === "expired").length,
        stockValuation: Number(
          batches.reduce((sum, batch) => sum + (batch.availableQuantity || 0) * (batch.unitCost || 0), 0).toFixed(2),
        ),
      },
      distributions: {
        mostDispensedMedicines: groupCounts(
          prescriptions.flatMap((prescription) => prescription.items || []).filter((item) => item.dispensedQuantity > 0),
          (item) => item.name || "Unknown",
        ),
        stockByStatus: groupCounts(batches, (batch) => batch.status || "unknown"),
      },
      filters,
    };
  },

  async getLaboratoryAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "laboratory");
    const filters = analyticsFilterService.parse(query);
    const requests = await LabRequest.find({
      requestedAt: { $gte: filters.from, $lt: filters.to },
    }).lean();

    const turnaroundTimes = requests
      .filter((request) => request.requestedAt && request.completedAt)
      .map((request) => Math.round((new Date(request.completedAt) - new Date(request.requestedAt)) / 3600000));
    const sorted = [...turnaroundTimes].sort((a, b) => a - b);

    return {
      totals: {
        total: requests.length,
        pending: requests.filter((item) => ["requested", "acknowledged", "sample_pending", "sample_collected", "processing"].includes(item.status)).length,
        completed: requests.filter((item) => ["completed", "verified", "doctor_reviewed"].includes(item.status)).length,
        criticalResults: await LabResult.countDocuments({ criticalFlag: true, updatedAt: { $gte: filters.from, $lt: filters.to } }),
        averageTurnaroundHours: turnaroundTimes.length ? Number((turnaroundTimes.reduce((sum, value) => sum + value, 0) / turnaroundTimes.length).toFixed(1)) : 0,
        medianTurnaroundHours: sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0,
        recollectionRate: requests.length ? Number(((requests.filter((item) => item.status === "recollection_required").length / requests.length) * 100).toFixed(1)) : 0,
      },
      distributions: {
        byStatus: groupCounts(requests, (item) => item.status || "unknown"),
        byPriority: groupCounts(requests, (item) => item.priority || "unknown"),
        byDoctor: groupCounts(requests, (item) => item.doctorName || "Unassigned"),
      },
      filters,
    };
  },

  async getVaccinationAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "vaccination");
    const filters = analyticsFilterService.parse(query);
    const records = await VaccinationRecord.find({
      administeredDate: { $gte: filters.from, $lt: filters.to },
      ...(filters.village ? { village: filters.village } : {}),
    }).populate("vaccineRef").lean();
    const batches = await VaccineBatch.find().lean();

    return {
      totals: {
        administered: records.length,
        today: records.filter((item) => new Date(item.administeredDate).toDateString() === new Date().toDateString()).length,
        villagesCovered: new Set(records.map((item) => item.village || "Unknown")).size,
        expiringBatches: batches.filter((batch) => new Date(batch.expiryDate) < filters.to).length,
      },
      distributions: {
        byVillage: Object.fromEntries(Object.entries(groupCounts(records, (item) => item.village || "Unknown")).map(([key, value]) => [key, clampCount(value)])),
        byVaccine: groupCounts(records, (item) => item.vaccineRef?.vaccineName || "Unknown"),
        byAgeGroup: groupCounts(records, (item) => filters.ageToGroup(item.age)),
      },
      filters,
    };
  },

  async getVillageAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "village");
    const filters = analyticsFilterService.parse(query);
    const patients = await Patient.find({
      deletedAt: null,
      ...(filters.village ? { "address.village": filters.village } : {}),
    }).lean();
    const visits = await Visit.find({ visitDate: { $gte: filters.from, $lt: filters.to } }).lean();
    const vaccinations = await VaccinationRecord.find({ administeredDate: { $gte: filters.from, $lt: filters.to } }).lean();

    const villages = groupCounts(patients, (patient) => patient.address?.village || "Unknown");
    const visitByVillage = groupCounts(
      visits.map((visit) => ({ village: patients.find((patient) => patient.patientId === visit.patientId)?.address?.village || "Unknown" })),
      (item) => item.village,
    );

    return {
      summary: Object.entries(villages).map(([village, count]) => ({
        village,
        registeredPatients: clampCount(count),
        visits: visitByVillage[village] || 0,
        vaccinations: vaccinations.filter((item) => (item.village || "Unknown") === village).length,
      })),
      filters,
    };
  },

  async getDiseaseTrendAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "disease");
    const filters = analyticsFilterService.parse(query);
    const visits = await Visit.find({
      visitDate: { $gte: filters.from, $lt: filters.to },
      diagnosis: { $ne: "" },
    }).lean();

    const trends = groupCounts(visits, (visit) => visit.diagnosis || "Unspecified");
    const sorted = Object.entries(trends).sort(([, left], [, right]) => right - left);
    return {
      totals: {
        totalRecordedDiagnoses: visits.length,
      },
      trends: {
        recordedDiagnosisTrend: trendFromCounts(visits, "visitDate"),
        byDiagnosis: sorted.slice(0, 10).map(([diagnosis, count]) => ({ diagnosis, count: clampCount(count) })),
      },
      filters,
    };
  },

  async getFollowUpAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "followUps");
    const filters = analyticsFilterService.parse(query);
    const visits = await Visit.find({
      followUpDate: { $gte: filters.from, $lt: filters.to },
      ...(filters.doctorId ? { doctorRef: filters.doctorId } : {}),
    }).lean();
    return {
      totals: {
        scheduled: visits.length,
        overdue: visits.filter((visit) => visit.followUpDate && new Date(visit.followUpDate) < new Date()).length,
        completed: visits.filter((visit) => visit.visitStatus === "completed").length,
      },
      distributions: {
        byDoctor: groupCounts(visits, (visit) => visit.doctorName || "Unassigned"),
        byStatus: groupCounts(visits, (visit) => visit.visitStatus || "unknown"),
      },
      filters,
    };
  },

  async getDataQualityAnalytics(_query, actor) {
    analyticsPermissionService.assertAccess(actor, "dataQuality");
    const [
      missingPhone,
      missingVillage,
      missingEmergencyContact,
      missingDob,
      unlinkedVisits,
      prescriptionsWithoutDispensingState,
      labPendingVerification,
      vaccinationMissingBatch,
      staleAppointments,
    ] = await Promise.all([
      Patient.countDocuments({ phone: "" }),
      Patient.countDocuments({ "address.village": "" }),
      Patient.countDocuments({ emergencyContact: "" }),
      Patient.countDocuments({ dateOfBirth: null }),
      Visit.countDocuments({ patientRef: null }),
      Prescription.countDocuments({ status: { $in: ["created", "pending_pharmacy"] }, dispensedAt: null }),
      LabRequest.countDocuments({ status: "completed", verifiedAt: null }),
      VaccinationRecord.countDocuments({ batchRef: null }),
      Appointment.countDocuments({ status: "scheduled", appointmentDate: { $lt: new Date() } }),
    ]);
    return {
      indicators: {
        missingPhone,
        missingVillage,
        missingEmergencyContact,
        missingDob,
        unlinkedVisits,
        prescriptionsWithoutDispensingState,
        labPendingVerification,
        vaccinationMissingBatch,
        staleAppointments,
      },
    };
  },

  async getAuditAnalytics(query, actor) {
    analyticsPermissionService.assertAccess(actor, "audit");
    const filters = analyticsFilterService.parse(query);
    const logs = await AuditLog.find({
      createdAt: { $gte: filters.from, $lt: filters.to },
      ...(query.user ? { actorId: query.user } : {}),
      ...(query.role ? { actorRole: query.role } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.module ? { resourceType: query.module } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(filters.limit)
      .lean();

    return {
      items: logs.map((log) => ({
        ...log,
        metadata: log.metadata,
      })),
      pagination: { page: filters.page, limit: filters.limit, total: logs.length },
    };
  },
};
