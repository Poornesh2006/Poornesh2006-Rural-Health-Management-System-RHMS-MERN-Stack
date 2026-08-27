import { Patient } from "../models/patient.model.js";
import { tenantService } from "../services/tenant.service.js";

export const patientRepository = {
  async findAll({ search = "", status, gender, village, bloodGroup, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", tenant }) {
    const query = tenantService.scopeQuery({ deletedAt: null }, tenant);

    if (status) {
      query.status = status;
    }

    if (gender) {
      query.gender = gender;
    }

    if (village) {
      query["address.village"] = new RegExp(village, "i");
    }

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (search) {
      query.$or = [
        { fullName: new RegExp(search, "i") },
        { patientId: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { aadhaarNumber: new RegExp(search, "i") },
        { "address.village": new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    const [items, total] = await Promise.all([
      Patient.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Patient.countDocuments(query),
    ]);

    return { items, total };
  },

  async create(payload) {
    const patient = await Patient.create(payload);
    return patient.toObject();
  },

  async findByPatientId(patientId, tenant) {
    return Patient.findOne(tenantService.scopeQuery({ patientId, deletedAt: null }, tenant)).lean();
  },

  async findDocumentByPatientId(patientId, tenant) {
    return Patient.findOne(tenantService.scopeQuery({ patientId, deletedAt: null }, tenant));
  },

  async countAll() {
    return Patient.countDocuments({ deletedAt: null });
  },

  async countToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Patient.countDocuments({ createdAt: { $gte: start }, deletedAt: null });
  },

  async recentRegistrations(limit = 5) {
    return Patient.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(limit).lean();
  },
};
