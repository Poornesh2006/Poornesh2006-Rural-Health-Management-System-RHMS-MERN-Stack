import { LabRequest } from "../models/lab-request.model.js";
import { LabResult } from "../models/lab-result.model.js";
import { LabSample } from "../models/lab-sample.model.js";
import { LabTestCatalogue } from "../models/lab-test-catalogue.model.js";

export const laboratoryRepository = {
  async listTests({ search = "" } = {}) {
    const query = search ? { $or: [{ testCode: new RegExp(search, "i") }, { testName: new RegExp(search, "i") }] } : {};
    return LabTestCatalogue.find(query).sort({ testName: 1 }).lean();
  },

  async findTestById(id) {
    return LabTestCatalogue.findById(id);
  },

  async createTest(payload) {
    const test = await LabTestCatalogue.create(payload);
    return test.toObject();
  },

  async listRequests({ search = "", status, patientId } = {}) {
    const query = {};
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;
    if (search) {
      query.$or = [
        { requestNumber: new RegExp(search, "i") },
        { patientId: new RegExp(search, "i") },
        { doctorName: new RegExp(search, "i") },
      ];
    }
    return LabRequest.find(query).sort({ requestedAt: -1 }).lean();
  },

  async findRequestById(id) {
    return LabRequest.findById(id);
  },

  async findResultByRequestId(labRequestRef) {
    return LabResult.findOne({ labRequestRef });
  },

  async listPatientResults(patientId) {
    return LabResult.find({ patientId }).sort({ createdAt: -1 }).lean();
  },

  async listSamplesByRequest(labRequestRef) {
    return LabSample.find({ labRequestRef }).sort({ createdAt: -1 }).lean();
  },
};
