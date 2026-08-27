import { Appointment } from "../models/appointment.model.js";
import { Household } from "../models/household.model.js";
import { Patient } from "../models/patient.model.js";
import { VaccinationRecord } from "../models/vaccination-record.model.js";
import { Visit } from "../models/visit.model.js";
import { createHouseholdSchema } from "../validators/operations.validator.js";
import { generateAuditId } from "../utils/id-generator.js";

export const householdService = {
  async listHouseholds(tenant) {
    return Household.find({ facilityRef: tenant.facilityId }).sort({ createdAt: -1 }).lean();
  },

  async createHousehold(payload, actor, tenant) {
    const parsed = createHouseholdSchema.parse(payload);
    const members = await Promise.all(
      parsed.members.map(async (member) => {
        const patient = await Patient.findOne({ patientId: member.patientId, deletedAt: null }).lean();
        const [lastVisit, upcomingAppointment, vaccination] = await Promise.all([
          Visit.findOne({ patientId: member.patientId }).sort({ visitDate: -1 }).lean(),
          Appointment.findOne({ patientId: member.patientId, appointmentDate: { $gte: new Date() } }).sort({ appointmentDate: 1 }).lean(),
          VaccinationRecord.findOne({ patientId: member.patientId }).sort({ administeredDate: -1 }).lean(),
        ]);

        return {
          patientRef: patient?._id || null,
          patientId: member.patientId,
          name: member.name || patient?.fullName || member.patientId,
          relationship: member.relationship,
          lastVisitAt: lastVisit?.visitDate || null,
          vaccinationStatus: vaccination ? "recorded" : "pending_review",
          followUpStatus: patient?.status === "active" ? "clear" : "review",
          chronicConditionsSummary: patient?.medicalFlags?.chronicDiseases || [],
          upcomingAppointmentAt: upcomingAppointment?.appointmentDate || null,
        };
      }),
    );

    const household = await Household.create({
      householdId: generateAuditId("HH"),
      familyName: parsed.familyName,
      village: parsed.village,
      address: parsed.address,
      headOfHousehold: parsed.headOfHousehold,
      contactNumber: parsed.contactNumber,
      assignedHealthWorkerName: parsed.assignedHealthWorkerName,
      notes: parsed.notes,
      members,
      organizationRef: tenant.organizationId,
      facilityRef: tenant.facilityId,
      createdBy: actor.sub,
      updatedBy: actor.sub,
    });

    return household.toObject();
  },

  async getHouseholdById(householdId, tenant) {
    const household = await Household.findOne({ householdId, facilityRef: tenant.facilityId }).lean();
    if (!household) {
      const error = new Error("Household not found");
      error.statusCode = 404;
      throw error;
    }
    return household;
  },
};
