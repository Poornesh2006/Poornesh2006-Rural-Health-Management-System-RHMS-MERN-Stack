import { DoctorSchedule } from "../models/doctor-schedule.model.js";

export const doctorScheduleRepository = {
  async upsertByDoctor(doctorRef, payload) {
    return DoctorSchedule.findOneAndUpdate(
      { doctorRef },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
  },

  async findByDoctor(doctorRef) {
    return DoctorSchedule.findOne({ doctorRef }).lean();
  },

  async findActiveByDepartment(department) {
    return DoctorSchedule.find({ department, activeStatus: true }).lean();
  },
};
