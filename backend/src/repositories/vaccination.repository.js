import { VaccineBatch } from "../models/vaccine-batch.model.js";
import { Vaccine } from "../models/vaccine.model.js";
import { VaccinationRecord } from "../models/vaccination-record.model.js";
import { VaccinationSchedule } from "../models/vaccination-schedule.model.js";

export const vaccinationRepository = {
  async listVaccines({ search = "" } = {}) {
    const query = search ? { $or: [{ vaccineCode: new RegExp(search, "i") }, { vaccineName: new RegExp(search, "i") }] } : {};
    return Vaccine.find(query).sort({ vaccineName: 1 }).lean();
  },

  async findVaccineById(id) {
    return Vaccine.findById(id);
  },

  async createVaccine(payload) {
    const vaccine = await Vaccine.create(payload);
    return vaccine.toObject();
  },

  async listSchedules(vaccineId = "") {
    const query = vaccineId ? { vaccineRef: vaccineId } : {};
    return VaccinationSchedule.find(query).sort({ doseNumber: 1 }).lean();
  },

  async findScheduleById(id) {
    return VaccinationSchedule.findById(id);
  },

  async listBatches(vaccineId = "") {
    const query = vaccineId ? { vaccineRef: vaccineId } : {};
    return VaccineBatch.find(query).sort({ expiryDate: 1 }).populate("vaccineRef").lean();
  },

  async findBatchById(id) {
    return VaccineBatch.findById(id).populate("vaccineRef");
  },

  async listPatientVaccinations(patientId) {
    return VaccinationRecord.find({ patientId }).sort({ administeredDate: -1 }).populate("vaccineRef").populate("batchRef").lean();
  },
};
