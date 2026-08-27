import mongoose from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import { QueueEntry } from "../models/queue-entry.model.js";
import { Visit } from "../models/visit.model.js";
import { completeConsultationSchema, startConsultationSchema } from "../validators/consultation.validator.js";
import { calculateBmi } from "../utils/health-metrics.js";
import { generateVisitId } from "../utils/id-generator.js";
import { queueService } from "./queue.service.js";
import { auditService } from "./audit.service.js";
import { socketService } from "./socket.service.js";
import { appointmentService } from "./appointment.service.js";
import { laboratoryService } from "./laboratory.service.js";
import { pharmacyService } from "./pharmacy.service.js";

export const consultationService = {
  async startConsultation(payload, actor) {
    const parsedPayload = startConsultationSchema.parse(payload);
    const queueEntry = await QueueEntry.findById(parsedPayload.queueEntryId);

    if (!queueEntry) {
      const error = new Error("Queue entry not found");
      error.statusCode = 404;
      throw error;
    }

    const appointment = queueEntry.appointmentRef ? await Appointment.findById(queueEntry.appointmentRef) : null;
    const existingVisit = await Visit.findOne({ queueEntryRef: queueEntry._id });

    if (!existingVisit) {
      await Visit.create({
        visitId: generateVisitId(),
        patientId: queueEntry.patientId,
        patientRef: queueEntry.patientRef,
        doctorRef: queueEntry.doctorRef,
        doctorName: queueEntry.doctorName,
        visitStatus: "in_progress",
        appointmentRef: appointment?._id || null,
        queueEntryRef: queueEntry._id,
        createdBy: actor?.sub || null,
      });
    }

    const updatedQueue = await queueService.transitionQueue(String(queueEntry._id), "in_consultation", actor);
    await auditService.record({
      actor,
      action: "consultation_started",
      resourceType: "queue",
      resourceId: updatedQueue.displayToken,
    });

    return updatedQueue;
  },

  async completeConsultation(payload, actor) {
    const parsedPayload = completeConsultationSchema.parse(payload);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const queueEntry = await QueueEntry.findById(parsedPayload.queueEntryId).session(session);

      if (!queueEntry) {
        const error = new Error("Queue entry not found");
        error.statusCode = 404;
        throw error;
      }

      const appointment = queueEntry.appointmentRef
        ? await Appointment.findById(queueEntry.appointmentRef).session(session)
        : null;

      let visit = await Visit.findOne({ queueEntryRef: queueEntry._id }).session(session);

      if (!visit) {
        visit = await Visit.create(
          [
            {
              visitId: generateVisitId(),
              patientId: queueEntry.patientId,
              patientRef: queueEntry.patientRef,
              doctorRef: queueEntry.doctorRef,
              doctorName: queueEntry.doctorName,
              visitStatus: "in_progress",
              appointmentRef: appointment?._id || null,
              queueEntryRef: queueEntry._id,
              createdBy: actor?.sub || null,
            },
          ],
          { session },
        ).then((items) => items[0]);
      }

      const heightCm = parsedPayload.vitals?.heightCm;
      const weightKg = parsedPayload.vitals?.weightKg;
      visit.complaint = parsedPayload.complaint;
      visit.symptoms = parsedPayload.symptoms;
      visit.symptomDuration = parsedPayload.symptomDuration || "";
      visit.provisionalDiagnosis = parsedPayload.provisionalDiagnosis || "";
      visit.diagnosis = parsedPayload.diagnosis;
      visit.notes = parsedPayload.notes || "";
      visit.advice = parsedPayload.advice || "";
      visit.vitals = {
        ...visit.vitals,
        ...parsedPayload.vitals,
        bmi: calculateBmi(heightCm, weightKg),
        bloodPressure:
          parsedPayload.vitals?.systolicBp && parsedPayload.vitals?.diastolicBp
            ? `${parsedPayload.vitals.systolicBp}/${parsedPayload.vitals.diastolicBp}`
            : visit.vitals?.bloodPressure || "",
      };
      visit.prescription = parsedPayload.prescription;
      visit.labRequests = parsedPayload.labRequests.map((request) => ({
        ...request,
        requestedDate: request.requestedDate ? new Date(request.requestedDate) : new Date(),
        status: request.status || "requested",
      }));
      visit.visitStatus = parsedPayload.followUp?.enabled ? "follow_up_due" : "completed";
      if (parsedPayload.followUp?.enabled && parsedPayload.followUp.appointmentDate) {
        visit.followUpDate = new Date(parsedPayload.followUp.appointmentDate);
      }
      await visit.save({ session });

      const prescription = await pharmacyService.createPrescriptionFromVisit(visit, session);
      const labRequests = await laboratoryService.createRequestsFromVisit(visit, session);

      queueEntry.status = "completed";
      queueEntry.completedAt = new Date();
      await queueEntry.save({ session });

      if (appointment) {
        appointment.status = "completed";
        appointment.consultationCompletedAt = new Date();
        await appointment.save({ session });
      }

      let followUpAppointment = null;
      if (parsedPayload.followUp?.enabled && parsedPayload.followUp.appointmentDate && parsedPayload.followUp.startTime && parsedPayload.followUp.endTime) {
        followUpAppointment = await appointmentService.createFollowUp(
          {
            patientId: queueEntry.patientId,
            doctorId: queueEntry.doctorRef ? String(queueEntry.doctorRef) : "",
            doctorName: queueEntry.doctorName,
            department: parsedPayload.followUp.department || queueEntry.department,
            appointmentDate: parsedPayload.followUp.appointmentDate,
            startTime: parsedPayload.followUp.startTime,
            endTime: parsedPayload.followUp.endTime,
            appointmentType: "follow_up",
            reason: parsedPayload.followUp.reason || parsedPayload.diagnosis,
            symptomsSummary: parsedPayload.complaint,
            priority: queueEntry.priority,
            followUpForVisitId: String(visit._id),
          },
          actor,
        );
      }

      await session.commitTransaction();

      const response = {
        visit: visit.toObject(),
        queueEntry: queueEntry.toObject(),
        appointment: appointment?.toObject() || null,
        followUpAppointment,
        prescription: prescription?.toObject() || null,
        labRequests: labRequests.map((request) => request.toObject()),
      };

      await auditService.record({
        actor,
        action: "consultation_completed",
        resourceType: "visit",
        resourceId: visit.visitId,
      });

      socketService.emit("queue:completed", response.queueEntry, [
        `department:${queueEntry.department}`,
        ...(queueEntry.doctorRef ? [`doctor:${queueEntry.doctorRef}`] : []),
      ]);
      socketService.emit("dashboard:updated", { timestamp: new Date().toISOString() }, ["role:receptionist"]);
      socketService.emit("analytics:dashboard-updated", { scope: "consultation" }, ["role:admin", "role:doctor", "role:receptionist"]);
      if (prescription) {
        socketService.emit("pharmacy:prescription-updated", { prescriptionId: String(prescription._id), status: prescription.status }, ["role:pharmacist"]);
      }
      if (labRequests.length) {
        socketService.emit("lab:request-updated", { count: labRequests.length }, ["role:lab_technician"]);
      }

      return response;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
};
