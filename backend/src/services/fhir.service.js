import { Appointment } from "../models/appointment.model.js";
import { Consent } from "../models/consent.model.js";
import { Patient } from "../models/patient.model.js";
import { VaccinationRecord } from "../models/vaccination-record.model.js";
import { Visit } from "../models/visit.model.js";

function mapPatient(patient) {
  return {
    resourceType: "Patient",
    id: patient.patientId,
    name: [{ text: patient.fullName }],
    gender: patient.gender,
    birthDate: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0, 10) : undefined,
  };
}

function mapEncounter(visit) {
  return {
    resourceType: "Encounter",
    id: visit.visitId,
    status: visit.visitStatus,
    subject: { reference: `Patient/${visit.patientId}` },
    period: { start: visit.visitDate },
    reasonCode: visit.complaint ? [{ text: visit.complaint }] : [],
  };
}

function mapAppointment(appointment) {
  return {
    resourceType: "Appointment",
    id: appointment.appointmentNumber,
    status: appointment.status,
    description: appointment.reason,
    start: appointment.appointmentDate,
  };
}

function mapConsent(consent) {
  return {
    resourceType: "Consent",
    id: String(consent._id),
    status: consent.status,
    scope: { text: consent.scope },
    dateTime: consent.grantedAt,
  };
}

function mapImmunization(record) {
  return {
    resourceType: "Immunization",
    id: record.certificateNumber,
    status: "completed",
    occurrenceDateTime: record.administeredDate,
    doseQuantity: { value: record.doseNumber },
  };
}

export const fhirService = {
  async exportBundle({ patientId, resourceTypes = [] }) {
    const patient = await Patient.findOne({ patientId }).lean();
    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    const entries = [{ resource: mapPatient(patient) }];
    const includeAll = !resourceTypes.length;

    if (includeAll || resourceTypes.includes("Encounter")) {
      const visits = await Visit.find({ patientId }).lean();
      entries.push(...visits.map((item) => ({ resource: mapEncounter(item) })));
    }

    if (includeAll || resourceTypes.includes("Appointment")) {
      const appointments = await Appointment.find({ patientId }).lean();
      entries.push(...appointments.map((item) => ({ resource: mapAppointment(item) })));
    }

    if (includeAll || resourceTypes.includes("Consent")) {
      const consents = await Consent.find({ patient: patient._id }).lean();
      entries.push(...consents.map((item) => ({ resource: mapConsent(item) })));
    }

    if (includeAll || resourceTypes.includes("Immunization")) {
      const records = await VaccinationRecord.find({ patientId }).lean();
      entries.push(...records.map((item) => ({ resource: mapImmunization(item) })));
    }

    return {
      resourceType: "Bundle",
      type: "collection",
      entry: entries,
    };
  },
};
