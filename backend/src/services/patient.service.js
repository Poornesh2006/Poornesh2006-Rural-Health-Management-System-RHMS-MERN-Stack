import { patientRepository } from "../repositories/patient.repository.js";
import { laboratoryRepository } from "../repositories/laboratory.repository.js";
import { pharmacyRepository } from "../repositories/pharmacy.repository.js";
import { vaccinationRepository } from "../repositories/vaccination.repository.js";
import { Visit } from "../models/visit.model.js";
import { createPatientSchema, updatePatientSchema } from "../validators/patient.validator.js";
import { calculateAge, calculateBmi } from "../utils/health-metrics.js";
import { generatePatientId } from "../utils/id-generator.js";

export const patientService = {
  async listPatients(query, tenant) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const result = await patientRepository.findAll({
      search: query.search || "",
      status: query.status,
      gender: query.gender,
      village: query.village,
      bloodGroup: query.bloodGroup,
      page,
      limit,
      tenant,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc",
    });

    return {
      items: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
      },
    };
  },

  async createPatient(payload, actor, tenant) {
    const parsedPayload = createPatientSchema.parse(payload);
    const patientId = generatePatientId();
    const fullName = `${parsedPayload.firstName} ${parsedPayload.lastName}`.trim();
    const heightCm = parsedPayload.vitals?.heightCm;
    const weightKg = parsedPayload.vitals?.weightKg;

    return patientRepository.create({
      ...parsedPayload,
      patientId,
      qrCodeValue: `rhms://patient/${patientId}`,
      fullName,
      age: calculateAge(parsedPayload.dateOfBirth),
      vitals: {
        ...parsedPayload.vitals,
        bmi: calculateBmi(heightCm, weightKg),
      },
      createdBy: actor?.sub || null,
      updatedBy: actor?.sub || null,
      organizationRef: tenant?.organizationId || null,
      facilityRef: tenant?.facilityId || null,
      homeFacilityRef: tenant?.facilityId || null,
    });
  },

  async getPatientById(patientId, tenant) {
    const patient = await patientRepository.findByPatientId(patientId, tenant);

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    return patient;
  },

  async updatePatient(patientId, payload, actor, tenant) {
    const parsedPayload = updatePatientSchema.parse(payload);
    const patient = await patientRepository.findDocumentByPatientId(patientId, tenant);

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    Object.assign(patient, parsedPayload);

    if (parsedPayload.firstName || parsedPayload.lastName) {
      patient.fullName = `${parsedPayload.firstName || patient.firstName} ${parsedPayload.lastName || patient.lastName}`.trim();
    }

    if (parsedPayload.dateOfBirth) {
      patient.age = calculateAge(parsedPayload.dateOfBirth);
    }

    const heightCm = parsedPayload.vitals?.heightCm || patient.vitals?.heightCm;
    const weightKg = parsedPayload.vitals?.weightKg || patient.vitals?.weightKg;
    patient.vitals = {
      ...patient.vitals,
      ...parsedPayload.vitals,
      bmi: calculateBmi(heightCm, weightKg),
    };
    patient.updatedBy = actor?.sub || null;
    await patient.save();
    return patient.toObject();
  },

  async archivePatient(patientId, actor, tenant) {
    const patient = await patientRepository.findDocumentByPatientId(patientId, tenant);

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    patient.status = "archived";
    patient.archivedAt = new Date();
    patient.updatedBy = actor?.sub || null;
    await patient.save();
    return patient.toObject();
  },

  async getClinicalProfile(patientId, tenant) {
    const patient = await this.getPatientById(patientId, tenant);
    const [visits, prescriptions, labResults, vaccinations] = await Promise.all([
      Visit.find({ patientId }).sort({ visitDate: -1 }).lean(),
      pharmacyRepository.listPatientPrescriptions(patientId),
      laboratoryRepository.listPatientResults(patientId),
      vaccinationRepository.listPatientVaccinations(patientId),
    ]);

    const timeline = [
      ...visits.map((visit) => ({
        date: visit.visitDate,
        type: "visit",
        title: visit.diagnosis || "Clinical visit",
        note: visit.complaint || visit.notes || "Visit completed",
      })),
      ...prescriptions.map((prescription) => ({
        date: prescription.issuedAt,
        type: "prescription",
        title: `Prescription ${prescription.prescriptionNumber}`,
        note: `Status: ${prescription.status}`,
      })),
      ...labResults.map((result) => ({
        date: result.updatedAt,
        type: "lab_result",
        title: `Lab result ${result.testName}`,
        note: result.criticalFlag ? "Critical result flagged" : "Lab result available",
      })),
      ...vaccinations.map((record) => ({
        date: record.administeredDate,
        type: "vaccination",
        title: `${record.vaccineRef?.vaccineName || "Vaccination"} dose ${record.doseNumber}`,
        note: `Certificate ${record.certificateNumber}`,
      })),
    ].sort((left, right) => new Date(right.date) - new Date(left.date));

    return {
      patient,
      visits,
      prescriptions,
      labResults,
      vaccinations,
      timeline,
    };
  },
};
