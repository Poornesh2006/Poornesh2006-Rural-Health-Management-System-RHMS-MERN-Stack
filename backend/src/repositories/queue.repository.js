import { QueueEntry } from "../models/queue-entry.model.js";

export const queueRepository = {
  async create(payload, options = {}) {
    const entries = await QueueEntry.create([payload], options);
    return entries[0].toObject();
  },

  async findById(id) {
    return QueueEntry.findById(id);
  },

  async findActiveForPatient(patientId, department, queueDate) {
    const start = new Date(queueDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return QueueEntry.findOne({
      patientId,
      department,
      queueDate: { $gte: start, $lt: end },
      status: { $in: ["waiting", "called", "in_consultation", "skipped"] },
    });
  },

  async findAll(filters = {}) {
    const { doctorId, department, status, date } = filters;
    const query = {};

    if (doctorId) query.doctorRef = doctorId;
    if (department) query.department = department;
    if (status) query.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.queueDate = { $gte: start, $lt: end };
    }

    return QueueEntry.find(query).sort({ priority: -1, tokenNumber: 1 }).lean();
  },

  async findNextToken({ doctorId, department, date }) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return QueueEntry.findOne({
      queueDate: { $gte: start, $lt: end },
      ...(doctorId ? { doctorRef: doctorId } : {}),
      ...(department ? { department } : {}),
      status: { $in: ["waiting", "skipped"] },
    }).sort({ priority: -1, tokenNumber: 1 });
  },

  async findLastTokenForDate(queueDate, prefix) {
    const start = new Date(queueDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return QueueEntry.findOne({
      queueDate: { $gte: start, $lt: end },
      displayToken: new RegExp(`^${prefix}`),
    }).sort({ tokenNumber: -1 });
  },
};
