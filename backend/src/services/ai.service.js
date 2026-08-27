import { AiAudit } from "../models/ai-audit.model.js";
import { Patient } from "../models/patient.model.js";
import { Visit } from "../models/visit.model.js";

const DISCLAIMER = "AI-generated content is for assistance only. It must be reviewed and approved by an authorized healthcare professional before use.";

function redactPatient(patient) {
  return {
    patientId: patient.patientId,
    fullName: patient.fullName,
    gender: patient.gender,
    age: patient.age,
    village: patient.address?.village || "",
  };
}

function buildMockSummary(patient, visits) {
  const recent = visits.slice(0, 3);
  return [
    DISCLAIMER,
    `Patient ${patient.fullName} has ${visits.length} recorded visits in the selected history.`,
    recent.length ? `Recent complaints include: ${recent.map((item) => item.complaint || "general follow-up").join(", ")}.` : "No recent visits were found.",
    `Recorded allergies: ${(patient.medicalFlags?.allergies || []).join(", ") || "None documented"}.`,
    `Chronic conditions: ${(patient.medicalFlags?.chronicDiseases || []).join(", ") || "None documented"}.`,
  ].join(" ");
}

export const aiService = {
  async generateVisitHistorySummary({ patientId, actor, tenant }) {
    const patient = await Patient.findOne({ patientId }).lean();
    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    const visits = await Visit.find({ patientId }).sort({ visitDate: -1 }).limit(10).lean();
    const redactedPatient = redactPatient(patient);
    const draft = buildMockSummary(redactedPatient, visits);
    const audit = await AiAudit.create({
      feature: "visit-history-summary",
      provider: "mock",
      model: "safety-reviewed-template",
      user: actor.sub,
      role: actor.role,
      patientReference: patient._id,
      facility: tenant.facilityId,
      inputDataCategories: ["visit_history", "allergies", "chronic_conditions"],
      redactionApplied: true,
      outputStatus: "generated",
      metadata: {
        sourceVisitIds: visits.map((item) => item.visitId),
        draftLength: draft.length,
      },
    });

    return {
      disclaimer: DISCLAIMER,
      draft,
      reviewRequired: true,
      auditId: audit._id,
      sourceReferences: visits.map((item) => ({
        visitId: item.visitId,
        date: item.visitDate,
        complaint: item.complaint,
      })),
      redactedPreview: redactedPatient,
    };
  },

  async detectPotentialDuplicates({ actor }) {
    const patients = await Patient.find().sort({ createdAt: -1 }).limit(100).lean();
    const matches = [];

    for (let index = 0; index < patients.length; index += 1) {
      for (let candidate = index + 1; candidate < patients.length; candidate += 1) {
        const left = patients[index];
        const right = patients[candidate];
        let score = 0;
        const matchedFields = [];

        if (left.phone && right.phone && left.phone === right.phone) {
          score += 0.45;
          matchedFields.push("phone");
        }

        if (left.dateOfBirth && right.dateOfBirth && new Date(left.dateOfBirth).toISOString().slice(0, 10) === new Date(right.dateOfBirth).toISOString().slice(0, 10)) {
          score += 0.2;
          matchedFields.push("dateOfBirth");
        }

        if (left.fullName?.toLowerCase() === right.fullName?.toLowerCase()) {
          score += 0.25;
          matchedFields.push("fullName");
        }

        if (left.address?.village && right.address?.village && left.address.village.toLowerCase() === right.address.village.toLowerCase()) {
          score += 0.1;
          matchedFields.push("village");
        }

        if (score >= 0.5) {
          matches.push({
            left: { patientId: left.patientId, fullName: left.fullName },
            right: { patientId: right.patientId, fullName: right.fullName },
            score: Number(score.toFixed(2)),
            matchedFields,
            conflictingFields: ["guardianName", "address"],
            autoMerge: false,
          });
        }
      }
    }

    await AiAudit.create({
      feature: "duplicate-detection",
      provider: "mock",
      model: "weighted-rules-v1",
      user: actor.sub,
      role: actor.role,
      inputDataCategories: ["identity_fields"],
      redactionApplied: true,
      outputStatus: "generated",
      metadata: {
        candidateCount: matches.length,
      },
    });

    return {
      disclaimer: DISCLAIMER,
      reviewRequired: true,
      matches,
    };
  },

  async reviewAudit(auditId, payload) {
    const audit = await AiAudit.findById(auditId);
    if (!audit) {
      const error = new Error("AI audit record not found");
      error.statusCode = 404;
      throw error;
    }

    audit.outputStatus = payload.status;
    audit.accepted = payload.status === "accepted";
    audit.edited = payload.status === "edited";
    audit.rejected = payload.status === "rejected";
    audit.metadata = {
      ...audit.metadata,
      reviewerNotes: payload.notes || "",
    };
    await audit.save();
    return audit.toObject();
  },

  async listGovernanceSummary() {
    const audits = await AiAudit.find().sort({ createdAt: -1 }).lean();
    return {
      disclaimer: DISCLAIMER,
      featuresEnabled: ["visit-history-summary", "duplicate-detection"],
      provider: "mock",
      model: "review-only",
      usage: audits.length,
      failures: audits.filter((item) => item.outputStatus === "rejected").length,
      approvalRate: audits.length ? audits.filter((item) => item.accepted).length / audits.length : 0,
      items: audits,
    };
  },
};
