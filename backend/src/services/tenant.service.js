import { Facility } from "../models/facility.model.js";
import { FeatureFlag } from "../models/feature-flag.model.js";
import { Organization } from "../models/organization.model.js";
import { User } from "../models/user.model.js";
import { generateAuditId } from "../utils/id-generator.js";

async function ensureDefaultOrganizationAndFacility() {
  let organization = await Organization.findOne({ organizationCode: "ORG-DEFAULT" });

  if (!organization) {
    organization = await Organization.create({
      organizationCode: "ORG-DEFAULT",
      name: "Default Rural Health Organization",
      type: "government",
      defaultLanguage: "en",
      timezone: "Asia/Kolkata",
      featureFlags: {
        multi_phc: false,
      },
    });
  }

  let facility = await Facility.findOne({ facilityCode: "FAC-DEFAULT" });

  if (!facility) {
    facility = await Facility.create({
      facilityCode: "FAC-DEFAULT",
      organization: organization._id,
      facilityType: "PHC",
      name: "Default Primary Health Centre",
      shortName: "Default PHC",
      address: {
        district: "Default District",
        state: "Tamil Nadu",
      },
      departments: ["General OP", "Pharmacy", "Laboratory", "Vaccination"],
      services: ["OP", "Lab", "Pharmacy", "Vaccination"],
    });
  }

  return { organization, facility };
}

export const tenantService = {
  async ensureDefaults() {
    const { organization, facility } = await ensureDefaultOrganizationAndFacility();

    await User.updateMany(
      { organizationRef: null },
      {
        organizationRef: organization._id,
        primaryFacilityRef: facility._id,
        activeFacilityRef: facility._id,
        $addToSet: { allowedFacilities: facility._id },
      },
    );

    return { organization, facility };
  },

  async resolveContext(user, activeFacilityId) {
    const defaults = await ensureDefaultOrganizationAndFacility();

    if (!user) {
      return {
        organizationId: String(defaults.organization._id),
        facilityId: String(defaults.facility._id),
        allowedFacilityIds: [String(defaults.facility._id)],
      };
    }

    const fullUser = await User.findById(user.sub).lean();
    const organizationId = String(fullUser?.organizationRef || defaults.organization._id);
    const allowedFacilityIds = (fullUser?.allowedFacilities?.length ? fullUser.allowedFacilities : [fullUser?.primaryFacilityRef || defaults.facility._id]).map(String);
    const preferred = activeFacilityId && allowedFacilityIds.includes(String(activeFacilityId))
      ? String(activeFacilityId)
      : String(fullUser?.activeFacilityRef || fullUser?.primaryFacilityRef || defaults.facility._id);

    return {
      organizationId,
      facilityId: preferred,
      allowedFacilityIds,
    };
  },

  scopeQuery(query = {}, tenantContext = {}) {
    if (!tenantContext?.facilityId) {
      return query;
    }

    return {
      ...query,
      $or: [{ facilityRef: tenantContext.facilityId }, { facilityRef: null }, { facilityRef: { $exists: false } }],
    };
  },

  async switchFacility(userId, facilityId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const allowed = (user.allowedFacilities || []).map(String);
    if (!allowed.includes(String(facilityId)) && String(user.primaryFacilityRef) !== String(facilityId)) {
      const error = new Error("Facility switch not permitted");
      error.statusCode = 403;
      throw error;
    }

    user.activeFacilityRef = facilityId;
    await user.save();
    return user.toObject();
  },

  async listFacilitiesForUser(userId) {
    const user = await User.findById(userId).populate("allowedFacilities primaryFacilityRef organizationRef");
    if (!user) {
      return [];
    }

    const allowed = user.allowedFacilities?.length ? user.allowedFacilities : user.primaryFacilityRef ? [user.primaryFacilityRef] : [];
    return allowed.map((item) => ({
      _id: item._id,
      name: item.name,
      facilityCode: item.facilityCode,
      facilityType: item.facilityType,
    }));
  },

  async listOrganizationsAndFacilities() {
    const organizations = await Organization.find().sort({ createdAt: -1 }).lean();
    const facilities = await Facility.find().sort({ createdAt: -1 }).lean();
    return { organizations, facilities };
  },

  async upsertFeatureFlags() {
    const defaults = [
      ["multi_phc", true],
      ["referrals", true],
      ["cross_facility_records", true],
      ["fhir_export", true],
      ["ai_summaries", true],
      ["ai_duplicate_detection", true],
      ["mobile_app", true],
      ["outreach_mode", true],
    ];

    for (const [key, enabled] of defaults) {
      const existing = await FeatureFlag.findOne({ key });
      if (!existing) {
        await FeatureFlag.create({
          key,
          description: generateAuditId(`FLAG-${key.toUpperCase().slice(0, 4)}`),
          enabled,
        });
      }
    }
  },
};
