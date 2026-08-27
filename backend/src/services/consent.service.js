import { Consent } from "../models/consent.model.js";
import { Patient } from "../models/patient.model.js";

export const consentService = {
  async listConsents(tenant) {
    return Consent.find({
      $or: [{ sourceFacility: tenant.facilityId }, { receivingFacility: tenant.facilityId }],
    })
      .populate("patient sourceFacility receivingFacility")
      .sort({ createdAt: -1 })
      .lean();
  },

  async createConsent(payload, actor, tenant) {
    const patient = await Patient.findOne({ patientId: payload.patientId });
    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    return Consent.create({
      patient: patient._id,
      organization: tenant.organizationId,
      sourceFacility: payload.sourceFacility || tenant.facilityId,
      receivingFacility: payload.receivingFacility,
      consentType: payload.consentType,
      purpose: payload.purpose,
      scope: payload.scope || "summary",
      grantedAt: payload.grantedAt || new Date(),
      expiresAt: payload.expiresAt || null,
      status: payload.status || "active",
      capturedBy: actor.sub,
      method: payload.method || "written",
      metadata: payload.metadata || {},
    }).then((item) => item.toObject());
  },

  async revokeConsent(consentId, actor) {
    const consent = await Consent.findById(consentId);
    if (!consent) {
      const error = new Error("Consent not found");
      error.statusCode = 404;
      throw error;
    }

    consent.status = "revoked";
    consent.revokedAt = new Date();
    consent.metadata = {
      ...consent.metadata,
      revokedBy: actor.sub,
    };
    await consent.save();
    return consent.toObject();
  },

  async assertCrossFacilityAccess({ patientId, sourceFacility, receivingFacility, consentType }) {
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    const consent = await Consent.findOne({
      patient: patient._id,
      sourceFacility,
      receivingFacility,
      consentType,
      status: "active",
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).lean();

    if (!consent) {
      const error = new Error("Valid consent is required for cross-facility access");
      error.statusCode = 403;
      throw error;
    }

    return consent;
  },
};
