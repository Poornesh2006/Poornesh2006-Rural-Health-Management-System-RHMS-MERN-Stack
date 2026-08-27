import { Visit } from "../models/visit.model.js";

export const visitRepository = {
  async create(payload) {
    const visit = await Visit.create(payload);
    return visit.toObject();
  },

  async findByPatientId(patientId) {
    return Visit.find({ patientId }).sort({ visitDate: -1 }).lean();
  },

  async countToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Visit.countDocuments({ visitDate: { $gte: start } });
  },
};
