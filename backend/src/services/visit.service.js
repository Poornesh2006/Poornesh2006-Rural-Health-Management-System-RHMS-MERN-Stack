import { patientRepository } from "../repositories/patient.repository.js";
import { visitRepository } from "../repositories/visit.repository.js";
import { createVisitSchema } from "../validators/visit.validator.js";
import { calculateBmi } from "../utils/health-metrics.js";
import { generateVisitId } from "../utils/id-generator.js";

export const visitService = {
  async createVisit(payload, actor) {
    const parsedPayload = createVisitSchema.parse(payload);
    const patient = await patientRepository.findDocumentByPatientId(parsedPayload.patientId);

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    const heightCm = parsedPayload.vitals?.heightCm;
    const weightKg = parsedPayload.vitals?.weightKg;

    return visitRepository.create({
      ...parsedPayload,
      visitId: generateVisitId(),
      patientRef: patient._id,
      createdBy: actor?.sub || null,
      vitals: {
        ...parsedPayload.vitals,
        bmi: calculateBmi(heightCm, weightKg),
      },
    });
  },

  async listPatientVisits(patientId) {
    return visitRepository.findByPatientId(patientId);
  },
};
