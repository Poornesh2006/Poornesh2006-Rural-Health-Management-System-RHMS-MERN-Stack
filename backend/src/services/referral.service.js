import PDFDocument from "pdfkit";
import { Patient } from "../models/patient.model.js";
import { Referral } from "../models/referral.model.js";
import { generateAuditId } from "../utils/id-generator.js";
import { consentService } from "./consent.service.js";

function generateReferralPdfBuffer(referral, patient) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text("Referral Document");
    doc.moveDown();
    doc.fontSize(12).text(`Referral Number: ${referral.referralNumber}`);
    doc.text(`Patient: ${patient.fullName} (${patient.patientId})`);
    doc.text(`Reason: ${referral.reason}`);
    doc.text(`Urgency: ${referral.urgency}`);
    doc.text(`Clinical Summary: ${referral.clinicalSummary || "Not provided"}`);
    doc.text(`Shared Documents: ${referral.selectedDocuments?.join(", ") || "None selected"}`);
    doc.text(`Consent Reference: ${referral.consent || "Pending"}`);
    doc.text("AI-generated content is for assistance only. It must be reviewed and approved by an authorized healthcare professional before use.");
    doc.end();
  });
}

export const referralService = {
  async listReferrals(tenant) {
    return Referral.find({
      $or: [{ sourceFacility: tenant.facilityId }, { destinationFacility: tenant.facilityId }],
    })
      .populate("patient sourceFacility destinationFacility consent")
      .sort({ createdAt: -1 })
      .lean();
  },

  async createReferral(payload, actor, tenant) {
    const patient = await Patient.findOne({ patientId: payload.patientId });
    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    if (!payload.consentId) {
      const error = new Error("Consent is required before sending referral");
      error.statusCode = 400;
      throw error;
    }

    await consentService.assertCrossFacilityAccess({
      patientId: payload.patientId,
      sourceFacility: tenant.facilityId,
      receivingFacility: payload.destinationFacility,
      consentType: "referral",
    });

    const referral = await Referral.create({
      referralNumber: generateAuditId("REF"),
      patient: patient._id,
      sourceFacility: tenant.facilityId,
      sourceDoctor: actor.sub,
      destinationFacility: payload.destinationFacility,
      destinationDepartment: payload.destinationDepartment || "",
      destinationDoctor: payload.destinationDoctor || null,
      reason: payload.reason,
      urgency: payload.urgency || "routine",
      clinicalSummary: payload.clinicalSummary || "",
      selectedDocuments: payload.selectedDocuments || [],
      consent: payload.consentId,
      status: payload.status || "sent",
      sentAt: new Date(),
      createdBy: actor.sub,
      updatedBy: actor.sub,
    });

    return referral.toObject();
  },

  async updateStatus(referralId, payload, actor) {
    const referral = await Referral.findById(referralId);
    if (!referral) {
      const error = new Error("Referral not found");
      error.statusCode = 404;
      throw error;
    }

    referral.status = payload.status;
    referral.updatedBy = actor.sub;
    if (payload.status === "accepted") referral.acceptedAt = new Date();
    if (payload.status === "scheduled") referral.scheduledAt = new Date();
    if (payload.status === "completed") {
      referral.completedAt = new Date();
      referral.outcomeSummary = payload.outcomeSummary || referral.outcomeSummary;
    }
    await referral.save();
    return referral.toObject();
  },

  async generatePdf(referralId) {
    const referral = await Referral.findById(referralId).lean();
    if (!referral) {
      const error = new Error("Referral not found");
      error.statusCode = 404;
      throw error;
    }

    const patient = await Patient.findById(referral.patient).lean();
    return generateReferralPdfBuffer(referral, patient);
  },
};
