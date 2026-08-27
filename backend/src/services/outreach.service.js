import { OutreachCamp } from "../models/outreach-camp.model.js";
import { generateAuditId } from "../utils/id-generator.js";

export const outreachService = {
  async listCamps(tenant) {
    return OutreachCamp.find({ facility: tenant.facilityId }).sort({ date: -1 }).lean();
  },

  async createCamp(payload, actor, tenant) {
    return OutreachCamp.create({
      campNumber: generateAuditId("CMP"),
      organization: tenant.organizationId,
      facility: tenant.facilityId,
      village: payload.village,
      date: payload.date,
      team: payload.team || [],
      servicesOffered: payload.servicesOffered || [],
      expectedPatients: payload.expectedPatients || 0,
      summary: payload.summary || "",
      createdBy: actor.sub,
    }).then((item) => item.toObject());
  },
};
