import mongoose from "mongoose";
import { QueueEntry } from "../models/queue-entry.model.js";
import { Patient } from "../models/patient.model.js";
import { Appointment } from "../models/appointment.model.js";
import { queueRepository } from "../repositories/queue.repository.js";
import {
  queueActionSchema,
  queuePrioritySchema,
  listQueueQuerySchema,
  queuePublicQuerySchema,
} from "../validators/queue.validator.js";
import { queueTransitionService } from "./queue-transition.service.js";
import { socketService } from "./socket.service.js";
import { auditService } from "./audit.service.js";
import { notificationService } from "./notification.service.js";

function getTokenPrefix(department, priority) {
  if (priority === "emergency") return "E";
  if (/maternal/i.test(department)) return "M";
  if (/dental/i.test(department)) return "D";
  return "G";
}

function estimateWaitMinutes(entriesAhead) {
  return Math.max(entriesAhead, 0) * 12;
}

export const queueService = {
  async generateTokenForAppointment(appointment, payload, actor) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const appointmentDoc = appointment.toObject ? appointment : await Appointment.findById(appointment._id).session(session);
      const patientDoc = await Patient.findById(appointmentDoc.patientRef).session(session);

      const queueDate = new Date();
      queueDate.setHours(0, 0, 0, 0);

      const existingEntry = await queueRepository.findActiveForPatient(
        patientDoc.patientId,
        appointmentDoc.department,
        queueDate,
      );

      if (existingEntry) {
        const error = new Error("Patient already has an active queue entry for this department");
        error.statusCode = 409;
        throw error;
      }

      const prefix = getTokenPrefix(appointmentDoc.department, payload.priority || appointmentDoc.priority);
      const lastToken = await QueueEntry.findOne({
        queueDate: { $gte: queueDate, $lt: new Date(queueDate.getTime() + 24 * 60 * 60 * 1000) },
        displayToken: new RegExp(`^${prefix}`),
      })
        .sort({ tokenNumber: -1 })
        .session(session);

      const tokenNumber = (lastToken?.tokenNumber || 0) + 1;
      const displayToken = `${prefix}${String(tokenNumber).padStart(3, "0")}`;

      const waitingEntries = await QueueEntry.countDocuments({
        queueDate: { $gte: queueDate, $lt: new Date(queueDate.getTime() + 24 * 60 * 60 * 1000) },
        department: appointmentDoc.department,
        status: { $in: ["waiting", "called", "skipped", "in_consultation"] },
      }).session(session);

      const queueEntry = await QueueEntry.create(
        [
          {
            tokenNumber,
            displayToken,
            appointmentRef: appointmentDoc._id,
            patientRef: patientDoc._id,
            patientId: patientDoc.patientId,
            patientName: patientDoc.fullName,
            doctorRef: appointmentDoc.doctorRef,
            doctorName: appointmentDoc.doctorName,
            department: appointmentDoc.department,
            queueDate,
            queueType: payload.queueType || "appointment",
            priority: payload.priority || appointmentDoc.priority,
            status: "waiting",
            checkedInAt: new Date(),
            estimatedWaitMinutes: estimateWaitMinutes(waitingEntries),
            position: waitingEntries + 1,
            createdBy: actor?.sub || null,
            emergencyReason: payload.emergencyReason || "",
          },
        ],
        { session },
      );

      await Appointment.updateOne(
        { _id: appointmentDoc._id },
        {
          $set: {
            tokenRef: queueEntry[0]._id,
            queueEntryRef: queueEntry[0]._id,
            status: "waiting",
            checkedInAt: new Date(),
            updatedBy: actor?.sub || null,
          },
        },
        { session },
      );

      await session.commitTransaction();

      const created = queueEntry[0].toObject();
      socketService.emit("queue:token-created", created, [
        `department:${created.department}`,
        ...(created.doctorRef ? [`doctor:${created.doctorRef}`] : []),
        "role:receptionist",
      ]);
      socketService.emit("analytics:queue-updated", { scope: "token_created" }, ["role:admin", "role:receptionist"]);

      await notificationService.create({
        title: "Patient checked in",
        description: `${created.displayToken} created for ${created.patientName}`,
        audienceRole: "receptionist",
        audienceDoctorId: created.doctorRef ? String(created.doctorRef) : "",
        audienceDepartment: created.department,
        entityType: "queue",
        entityId: created.displayToken,
      });

      return created;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async listQueue(query) {
    const parsedQuery = listQueueQuerySchema.parse(query);
    return queueRepository.findAll({
      doctorId: parsedQuery.doctorId,
      department: parsedQuery.department,
      status: parsedQuery.status,
      date: parsedQuery.date || new Date().toISOString(),
    });
  },

  async listPublicQueue(query) {
    const parsedQuery = queuePublicQuerySchema.parse(query);
    const queue = await queueRepository.findAll({
      department: parsedQuery.department,
      date: new Date().toISOString(),
    });

    return queue.map((entry) => ({
      _id: entry._id,
      displayToken: entry.displayToken,
      doctorName: entry.doctorName,
      department: entry.department,
      status: entry.status,
      position: entry.position,
      consultationRoom: entry.department,
    }));
  },

  async getQueueById(id) {
    const queueEntry = await queueRepository.findById(id);
    if (!queueEntry) {
      const error = new Error("Queue entry not found");
      error.statusCode = 404;
      throw error;
    }
    return queueEntry;
  },

  async transitionQueue(id, nextStatus, actor, payload = {}, options = {}) {
    const queueEntry = await queueRepository.findById(id);
    if (!queueEntry) {
      const error = new Error("Queue entry not found");
      error.statusCode = 404;
      throw error;
    }

    queueTransitionService.assertCanTransition(queueEntry.status, nextStatus, options);

    queueEntry.status = nextStatus;
    if (nextStatus === "called") queueEntry.calledAt = new Date();
    if (nextStatus === "in_consultation") queueEntry.consultationStartedAt = new Date();
    if (nextStatus === "completed") queueEntry.completedAt = new Date();
    if (nextStatus === "skipped") {
      queueEntry.skippedAt = new Date();
      queueEntry.skippedCount += 1;
    }
    if (nextStatus === "no_show") {
      queueEntry.noShowReason = payload.reason || "";
    }

    await queueEntry.save();

    if (queueEntry.appointmentRef) {
      const appointment = await Appointment.findById(queueEntry.appointmentRef);
      if (appointment) {
        const appointmentStatusMap = {
          waiting: "waiting",
          called: "called",
          in_consultation: "in_consultation",
          completed: "completed",
          cancelled: "cancelled",
          no_show: "missed",
          skipped: "waiting",
        };

        appointment.status = appointmentStatusMap[nextStatus] || appointment.status;
        if (nextStatus === "in_consultation") appointment.consultationStartedAt = new Date();
        if (nextStatus === "completed") appointment.consultationCompletedAt = new Date();
        if (nextStatus === "cancelled") appointment.cancelledAt = new Date();
        if (nextStatus === "no_show") appointment.missedAt = new Date();
        await appointment.save();
      }
    }

    await auditService.record({
      actor,
      action: `queue_${nextStatus}`,
      resourceType: "queue",
      resourceId: queueEntry.displayToken,
      metadata: { reason: payload.reason || "" },
    });

    socketService.emit("queue:updated", queueEntry.toObject(), [
      `department:${queueEntry.department}`,
      ...(queueEntry.doctorRef ? [`doctor:${queueEntry.doctorRef}`] : []),
      `public-display:${queueEntry.department}`,
      "role:receptionist",
    ]);
    socketService.emit("analytics:queue-updated", { scope: nextStatus }, ["role:admin", "role:receptionist", ...(queueEntry.doctorRef ? [`doctor:${queueEntry.doctorRef}`] : [])]);

    const eventMap = {
      called: "queue:called",
      in_consultation: "queue:started",
      skipped: "queue:skipped",
      completed: "queue:completed",
    };

    if (eventMap[nextStatus]) {
      socketService.emit(eventMap[nextStatus], queueEntry.toObject(), [
        `department:${queueEntry.department}`,
        ...(queueEntry.doctorRef ? [`doctor:${queueEntry.doctorRef}`] : []),
      ]);
    }

    return queueEntry.toObject();
  },

  async callNext(query, actor) {
    const nextEntry = await queueRepository.findNextToken({
      doctorId: query.doctorId,
      department: query.department,
      date: query.date || new Date().toISOString(),
    });

    if (!nextEntry) {
      const error = new Error("No patients waiting in queue");
      error.statusCode = 404;
      throw error;
    }

    return this.transitionQueue(String(nextEntry._id), "called", actor);
  },

  async changePriority(id, payload, actor) {
    const parsedPayload = queuePrioritySchema.parse(payload);
    const queueEntry = await queueRepository.findById(id);

    if (!queueEntry) {
      const error = new Error("Queue entry not found");
      error.statusCode = 404;
      throw error;
    }

    queueEntry.priority = parsedPayload.priority;
    queueEntry.emergencyReason = parsedPayload.emergencyReason || queueEntry.emergencyReason;
    await queueEntry.save();

    await auditService.record({
      actor,
      action: "queue_priority_changed",
      resourceType: "queue",
      resourceId: queueEntry.displayToken,
      metadata: { priority: parsedPayload.priority, emergencyReason: parsedPayload.emergencyReason || "" },
    });

    socketService.emit("queue:updated", queueEntry.toObject(), [
      `department:${queueEntry.department}`,
      ...(queueEntry.doctorRef ? [`doctor:${queueEntry.doctorRef}`] : []),
    ]);

    return queueEntry.toObject();
  },
};
