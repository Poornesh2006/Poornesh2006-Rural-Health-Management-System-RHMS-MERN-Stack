import { Appointment } from "../models/appointment.model.js";

export const appointmentRepository = {
  async create(payload, options = {}) {
    const appointment = await Appointment.create([payload], options);
    return appointment[0].toObject();
  },

  async findById(id) {
    return Appointment.findById(id);
  },

  async findByAppointmentNumber(appointmentNumber) {
    return Appointment.findOne({ appointmentNumber });
  },

  async findAll(filters) {
    const {
      page = 1,
      limit = 10,
      search = "",
      doctorId,
      patientId,
      department,
      status,
      priority,
      date,
      sortBy = "appointmentDate",
      sortOrder = "asc",
    } = filters;

    const query = { isArchived: false };

    if (doctorId) query.doctorRef = doctorId;
    if (patientId) query.patientId = patientId;
    if (department) query.department = department;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.appointmentDate = { $gte: start, $lt: end };
    }

    if (search) {
      query.$or = [
        { appointmentNumber: new RegExp(search, "i") },
        { patientId: new RegExp(search, "i") },
        { doctorName: new RegExp(search, "i") },
        { reason: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
    const [items, total] = await Promise.all([
      Appointment.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Appointment.countDocuments(query),
    ]);

    return { items, total };
  },

  async findDoctorDayAppointments(doctorId, appointmentDate) {
    const start = new Date(appointmentDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return Appointment.find({
      doctorRef: doctorId,
      appointmentDate: { $gte: start, $lt: end },
      status: { $nin: ["cancelled", "missed"] },
      isArchived: false,
    }).lean();
  },

  async countByDateAndStatus(date, status) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return Appointment.countDocuments({
      appointmentDate: { $gte: start, $lt: end },
      ...(status ? { status } : {}),
      isArchived: false,
    });
  },
};
