import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";
import { LabRequest } from "../models/lab-request.model.js";
import { LabResult } from "../models/lab-result.model.js";
import { LabSample } from "../models/lab-sample.model.js";
import { LabTestCatalogue } from "../models/lab-test-catalogue.model.js";
import { Patient } from "../models/patient.model.js";
import { Visit } from "../models/visit.model.js";
import { laboratoryRepository } from "../repositories/laboratory.repository.js";
import {
  doctorLabReviewSchema,
  labResultEntrySchema,
  labTestPayloadSchema,
  recollectionSchema,
  sampleCollectionSchema,
} from "../validators/laboratory.validator.js";
import { generateLabRequestNumber, generateSampleId } from "../utils/id-generator.js";
import { auditService } from "./audit.service.js";
import { labTransitionService } from "./lab-transition.service.js";
import { notificationService } from "./notification.service.js";
import { socketService } from "./socket.service.js";

function ensureRole(actor, roles) {
  if (!roles.includes(actor?.role)) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }
}

export const laboratoryService = {
  async createTest(payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.LAB_TECHNICIAN]);
    const parsed = labTestPayloadSchema.parse(payload);
    const test = await laboratoryRepository.createTest(parsed);
    await auditService.record({ actor, action: "lab_test_created", resourceType: "lab_test", resourceId: test.testCode });
    return test;
  },

  async listTests(query) {
    return laboratoryRepository.listTests({ search: query.search || "" });
  },

  async updateTest(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.LAB_TECHNICIAN]);
    const parsed = labTestPayloadSchema.partial().parse(payload);
    const test = await laboratoryRepository.findTestById(id);
    if (!test) {
      const error = new Error("Lab test not found");
      error.statusCode = 404;
      throw error;
    }
    Object.assign(test, parsed);
    await test.save();
    return test.toObject();
  },

  async deactivateTest(id, actor) {
    return this.updateTest(id, { activeStatus: false }, actor);
  },

  async listRequests(query) {
    return laboratoryRepository.listRequests({
      search: query.search || "",
      status: query.status,
      patientId: query.patientId,
    });
  },

  async getRequestById(id) {
    const request = await laboratoryRepository.findRequestById(id);
    if (!request) {
      const error = new Error("Lab request not found");
      error.statusCode = 404;
      throw error;
    }
    const [result, samples] = await Promise.all([
      laboratoryRepository.findResultByRequestId(id),
      laboratoryRepository.listSamplesByRequest(id),
    ]);
    return { request: request.toObject(), result: result?.toObject() || null, samples };
  },

  async acknowledgeRequest(id, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.LAB_TECHNICIAN]);
    const request = await laboratoryRepository.findRequestById(id);
    if (!request) {
      const error = new Error("Lab request not found");
      error.statusCode = 404;
      throw error;
    }
    labTransitionService.assertCanTransition(request.status, "acknowledged");
    request.status = "acknowledged";
    request.acknowledgedBy = actor?.sub || null;
    await request.save();
    await auditService.record({ actor, action: "lab_request_acknowledged", resourceType: "lab_request", resourceId: request.requestNumber });
    socketService.emit("lab:request-updated", { requestId: String(request._id), status: request.status }, ["role:lab_technician"]);
    socketService.emit("analytics:lab-updated", { scope: "request" }, ["role:admin", "role:lab_technician"]);
    return request.toObject();
  },

  async collectSample(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.LAB_TECHNICIAN]);
    const parsed = sampleCollectionSchema.parse(payload);
    const request = await laboratoryRepository.findRequestById(id);
    if (!request) {
      const error = new Error("Lab request not found");
      error.statusCode = 404;
      throw error;
    }
    if (request.status === "requested") {
      request.status = "sample_pending";
    }
    labTransitionService.assertCanTransition(request.status, "sample_collected");
    request.status = "sample_collected";
    request.sampleCollectedAt = parsed.collectionDate ? new Date(parsed.collectionDate) : new Date();
    await request.save();

    const sample = await LabSample.create({
      labRequestRef: request._id,
      sampleId: generateSampleId(),
      specimenType: parsed.specimenType,
      collectionDate: request.sampleCollectedAt,
      collectedBy: actor?.sub || null,
      collectionLocation: parsed.collectionLocation,
      status: "sample_collected",
    });

    await auditService.record({ actor, action: "sample_collected", resourceType: "lab_request", resourceId: request.requestNumber });
    return { request: request.toObject(), sample: sample.toObject() };
  },

  async requestRecollection(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.LAB_TECHNICIAN]);
    const parsed = recollectionSchema.parse(payload);
    const request = await laboratoryRepository.findRequestById(id);
    if (!request) {
      const error = new Error("Lab request not found");
      error.statusCode = 404;
      throw error;
    }
    if (!["sample_pending", "sample_collected", "processing"].includes(request.status)) {
      const error = new Error("Recollection can only be requested from an active lab workflow");
      error.statusCode = 409;
      throw error;
    }
    request.status = "recollection_required";
    await request.save();
    await auditService.record({
      actor,
      action: "sample_recollection_required",
      resourceType: "lab_request",
      resourceId: request.requestNumber,
      metadata: { reason: parsed.rejectionReason },
    });
    await notificationService.create({
      title: "Sample recollection required",
      description: `${request.requestNumber} needs recollection`,
      audienceRole: ROLES.LAB_TECHNICIAN,
      audienceDoctorId: request.doctorRef ? String(request.doctorRef) : "",
      entityType: "lab_request",
      entityId: request.requestNumber,
    });
    return request.toObject();
  },

  async startProcessing(id, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.LAB_TECHNICIAN]);
    const request = await laboratoryRepository.findRequestById(id);
    if (!request) {
      const error = new Error("Lab request not found");
      error.statusCode = 404;
      throw error;
    }
    labTransitionService.assertCanTransition(request.status, "processing");
    request.status = "processing";
    await request.save();
    return request.toObject();
  },

  async enterResult(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.LAB_TECHNICIAN]);
    const parsed = labResultEntrySchema.parse(payload);
    const request = await laboratoryRepository.findRequestById(id);
    if (!request) {
      const error = new Error("Lab request not found");
      error.statusCode = 404;
      throw error;
    }
    if (!["processing", "sample_collected"].includes(request.status)) {
      const error = new Error("Results can only be entered after collection or during processing");
      error.statusCode = 409;
      throw error;
    }
    if (request.status === "sample_collected") {
      request.status = "processing";
    }

    let result = await laboratoryRepository.findResultByRequestId(id);
    if (!result) {
      result = await LabResult.create({
        labRequestRef: request._id,
        patientId: request.patientId,
        patientRef: request.patientRef,
        visitRef: request.visitRef,
        testName: request.tests.map((test) => test.testName).join(", "),
        testRef: request.tests[0]?.testRef || null,
        enteredBy: actor?.sub || null,
      });
    }
    result.parameters = parsed.parameters;
    result.interpretation = parsed.interpretation;
    result.technicianNotes = parsed.technicianNotes;
    result.reportFiles = parsed.reportFiles;
    result.criticalFlag = parsed.criticalFlag;
    result.criticalReason = parsed.criticalReason;
    result.abnormalFlags = parsed.parameters.filter((parameter) => ["low", "high", "critical"].includes(parameter.flag)).map((parameter) => `${parameter.name}:${parameter.flag}`);
    result.enteredBy = actor?.sub || null;
    await result.save();

    request.status = "completed";
    request.completedAt = new Date();
    await request.save();

    if (result.criticalFlag) {
      await notificationService.create({
        title: "Critical lab result",
        description: `${request.requestNumber} has a critical result`,
        audienceDoctorId: request.doctorRef ? String(request.doctorRef) : "",
        audienceRole: ROLES.LAB_TECHNICIAN,
        entityType: "lab_result",
        entityId: request.requestNumber,
      });
      socketService.emit("lab:critical-result", { requestId: String(request._id), requestNumber: request.requestNumber }, [
        ...(request.doctorRef ? [`doctor:${request.doctorRef}`] : []),
        "role:lab_technician",
      ]);
    }

    socketService.emit("analytics:lab-updated", { scope: "result" }, ["role:admin", "role:lab_technician", ...(request.doctorRef ? [`doctor:${request.doctorRef}`] : [])]);

    await auditService.record({ actor, action: "lab_result_entered", resourceType: "lab_request", resourceId: request.requestNumber });
    return { request: request.toObject(), result: result.toObject() };
  },

  async verifyResult(id, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.LAB_TECHNICIAN]);
    const request = await laboratoryRepository.findRequestById(id);
    if (!request) {
      const error = new Error("Lab request not found");
      error.statusCode = 404;
      throw error;
    }
    labTransitionService.assertCanTransition(request.status, "verified");
    const result = await laboratoryRepository.findResultByRequestId(id);
    if (!result) {
      const error = new Error("Lab result not found");
      error.statusCode = 404;
      throw error;
    }
    result.verifiedBy = actor?.sub || null;
    result.verifiedAt = new Date();
    await result.save();
    request.status = "verified";
    request.verifiedAt = new Date();
    await request.save();
    await notificationService.create({
      title: "Lab result completed",
      description: `${request.requestNumber} is ready for doctor review`,
      audienceDoctorId: request.doctorRef ? String(request.doctorRef) : "",
      entityType: "lab_request",
      entityId: request.requestNumber,
    });
    socketService.emit("lab:result-completed", { requestId: String(request._id), status: request.status }, [
      ...(request.doctorRef ? [`doctor:${request.doctorRef}`] : []),
      "role:lab_technician",
    ]);
    socketService.emit("analytics:lab-updated", { scope: "verified" }, ["role:admin", "role:lab_technician", ...(request.doctorRef ? [`doctor:${request.doctorRef}`] : [])]);
    await auditService.record({ actor, action: "lab_result_verified", resourceType: "lab_request", resourceId: request.requestNumber });
    return { request: request.toObject(), result: result.toObject() };
  },

  async doctorReviewResult(id, payload, actor) {
    ensureRole(actor, [ROLES.ADMIN, ROLES.DOCTOR]);
    const parsed = doctorLabReviewSchema.parse(payload);
    const request = await laboratoryRepository.findRequestById(id);
    if (!request) {
      const error = new Error("Lab request not found");
      error.statusCode = 404;
      throw error;
    }
    labTransitionService.assertCanTransition(request.status, "doctor_reviewed");
    const result = await laboratoryRepository.findResultByRequestId(id);
    if (!result) {
      const error = new Error("Lab result not found");
      error.statusCode = 404;
      throw error;
    }
    result.doctorReviewedBy = actor?.sub || null;
    result.doctorReviewedAt = new Date();
    result.reviewNote = parsed.reviewNote;
    await result.save();
    request.status = "doctor_reviewed";
    request.doctorReviewedAt = new Date();
    await request.save();
    await auditService.record({ actor, action: "lab_result_doctor_reviewed", resourceType: "lab_request", resourceId: request.requestNumber });
    return { request: request.toObject(), result: result.toObject() };
  },

  async getPatientLabHistory(patientId) {
    return laboratoryRepository.listPatientResults(patientId);
  },

  async getDailyStatistics() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const requests = await LabRequest.find({ requestedAt: { $gte: start } }).lean();
    const criticalResults = await LabResult.countDocuments({ criticalFlag: true, updatedAt: { $gte: start } });
    return {
      requested: requests.length,
      samplesPending: requests.filter((request) => ["requested", "acknowledged", "sample_pending"].includes(request.status)).length,
      processing: requests.filter((request) => request.status === "processing").length,
      completed: requests.filter((request) => ["completed", "verified", "doctor_reviewed"].includes(request.status)).length,
      criticalResults,
    };
  },

  async createRequestsFromVisit(visit, session) {
    if (!visit.labRequests?.length) {
      return [];
    }
    const patient = await Patient.findById(visit.patientRef).session(session);
    if (!patient) {
      return [];
    }
    const existingRequest = await LabRequest.findOne({ visitRef: visit._id }).session(session);
    if (existingRequest) {
      return [existingRequest];
    }
    const tests = await Promise.all(
      visit.labRequests.map(async (request) => {
        const catalogue = await LabTestCatalogue.findOne({ testName: new RegExp(`^${request.testName}$`, "i") }).session(session);
        return {
          testName: request.testName,
          testRef: catalogue?._id || null,
          priority: request.priority || "routine",
          clinicalNotes: request.clinicalNotes || "",
          requestedDate: request.requestedDate ? new Date(request.requestedDate) : new Date(),
          status: request.status || "requested",
        };
      }),
    );
    const priority = tests.some((test) => test.priority === "emergency")
      ? "emergency"
      : tests.some((test) => test.priority === "urgent")
        ? "urgent"
        : "routine";

    const labRequest = await LabRequest.create([
      {
        requestNumber: generateLabRequestNumber(),
        patientId: visit.patientId,
        patientRef: patient._id,
        visitRef: visit._id,
        doctorRef: visit.doctorRef,
        doctorName: visit.doctorName,
        tests,
        priority,
        clinicalNotes: visit.notes || visit.complaint || "",
        requestedAt: new Date(),
        status: "requested",
      },
    ], { session }).then((items) => items[0]);

    return [labRequest];
  },
};
