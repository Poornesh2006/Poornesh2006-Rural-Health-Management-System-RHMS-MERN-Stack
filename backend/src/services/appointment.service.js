import mongoose from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import { Patient } from "../models/patient.model.js";
import { User } from "../models/user.model.js";
import { appointmentRepository } from "../repositories/appointment.repository.js";
import { patientRepository } from "../repositories/patient.repository.js";
import {
  checkInAppointmentSchema,
  createAppointmentSchema,
  followUpAppointmentSchema,
  listAppointmentsQuerySchema,
  rescheduleAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../validators/appointment.validator.js";
import { doctorScheduleService } from "./doctor-schedule.service.js";
import { auditService } from "./audit.service.js";
import { notificationService } from "./notification.service.js";
import { socketService } from "./socket.service.js";
import { queueService } from "./queue.service.js";

function generateAppointmentNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `APT-${stamp}-${String(Date.now()).slice(-6)}`;
}

function ensureRoleAllowed(actor, allowedRoles) {
  if (!allowedRoles.includes(actor?.role)) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }
}

export const appointmentService = {
  async createAppointment(payload, actor) {
    ensureRoleAllowed(actor, ["admin", "receptionist", "doctor", "health_worker"]);
    const parsedPayload = createAppointmentSchema.parse(payload);

    const [patient, doctor] = await Promise.all([
      patientRepository.findDocumentByPatientId(parsedPayload.patientId),
      parsedPayload.doctorId ? User.findById(parsedPayload.doctorId) : null,
    ]);

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    if (parsedPayload.doctorId && !doctor) {
      const error = new Error("Doctor not found");
      error.statusCode = 404;
      throw error;
    }

    const availableSlots = await doctorScheduleService.getAvailableSlots({
      doctorId: parsedPayload.doctorId,
      date: parsedPayload.appointmentDate,
    });

    if (parsedPayload.doctorId && !availableSlots.some((slot) => slot.startTime === parsedPayload.startTime && slot.endTime === parsedPayload.endTime)) {
      const error = new Error("Selected slot is not available");
      error.statusCode = 409;
      throw error;
    }

    const appointment = await appointmentRepository.create({
      appointmentNumber: generateAppointmentNumber(),
      patientRef: patient._id,
      patientId: patient.patientId,
      doctorRef: doctor?._id || null,
      doctorName: parsedPayload.doctorName || doctor?.fullName || "",
      department: parsedPayload.department,
      appointmentDate: new Date(parsedPayload.appointmentDate),
      startTime: parsedPayload.startTime,
      endTime: parsedPayload.endTime,
      appointmentType: parsedPayload.appointmentType,
      bookingSource: parsedPayload.bookingSource,
      reason: parsedPayload.reason,
      symptomsSummary: parsedPayload.symptomsSummary,
      priority: parsedPayload.priority,
      status: parsedPayload.bookingSource === "walk_in" ? "confirmed" : "scheduled",
      notes: parsedPayload.notes,
      createdBy: actor?.sub || null,
      updatedBy: actor?.sub || null,
    });

    await auditService.record({
      actor,
      action: "appointment_created",
      resourceType: "appointment",
      resourceId: appointment.appointmentNumber,
    });

    await notificationService.create({
      title: "Appointment created",
      description: `${appointment.appointmentNumber} booked for ${patient.fullName}`,
      audienceRole: "receptionist",
      audienceDoctorId: doctor?._id ? String(doctor._id) : "",
      audienceDepartment: appointment.department,
      entityType: "appointment",
      entityId: appointment.appointmentNumber,
    });

    socketService.emit("appointment:created", appointment, [
      "role:receptionist",
      `department:${appointment.department}`,
      ...(doctor?._id ? [`doctor:${doctor._id}`] : []),
    ]);

    return appointment;
  },

  async listAppointments(query) {
    const parsedQuery = listAppointmentsQuerySchema.parse(query);
    const result = await appointmentRepository.findAll({
      page: parsedQuery.page || 1,
      limit: parsedQuery.limit || 10,
      search: parsedQuery.search || "",
      doctorId: parsedQuery.doctorId,
      patientId: parsedQuery.patientId,
      department: parsedQuery.department,
      status: parsedQuery.status,
      priority: parsedQuery.priority,
      date: parsedQuery.date,
      sortBy: parsedQuery.sortBy || "appointmentDate",
      sortOrder: parsedQuery.sortOrder || "asc",
    });

    return {
      items: result.items,
      pagination: {
        page: parsedQuery.page || 1,
        limit: parsedQuery.limit || 10,
        total: result.total,
      },
    };
  },

  async getAppointmentById(id) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    return appointment.toObject();
  },

  async confirmAppointment(id, actor) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    appointment.status = "confirmed";
    appointment.updatedBy = actor?.sub || null;
    await appointment.save();
    socketService.emit("appointment:updated", appointment.toObject(), [`department:${appointment.department}`]);
    return appointment.toObject();
  },

  async checkInAppointment(id, payload, actor) {
    ensureRoleAllowed(actor, ["admin", "receptionist", "doctor"]);
    const parsedPayload = checkInAppointmentSchema.parse(payload || {});
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    const queueEntry = await queueService.generateTokenForAppointment(appointment, parsedPayload, actor);

    appointment.status = "waiting";
    appointment.checkedInAt = new Date();
    appointment.queueEntryRef = queueEntry._id || queueEntry.id || queueEntry.queueEntryRef || null;
    appointment.updatedBy = actor?.sub || null;
    await appointment.save();

    await auditService.record({
      actor,
      action: "appointment_checked_in",
      resourceType: "appointment",
      resourceId: appointment.appointmentNumber,
    });

    socketService.emit("appointment:checked-in", appointment.toObject(), [`department:${appointment.department}`]);

    return {
      appointment: appointment.toObject(),
      queueEntry,
    };
  },

  async cancelAppointment(id, payload, actor) {
    const parsedPayload = updateAppointmentStatusSchema.parse({ status: "cancelled", reason: payload?.reason || "" });
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    appointment.status = parsedPayload.status;
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = parsedPayload.reason;
    appointment.updatedBy = actor?.sub || null;
    await appointment.save();

    await auditService.record({
      actor,
      action: "appointment_cancelled",
      resourceType: "appointment",
      resourceId: appointment.appointmentNumber,
      metadata: { reason: parsedPayload.reason },
    });

    return appointment.toObject();
  },

  async markMissed(id, payload, actor) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    appointment.status = "missed";
    appointment.missedAt = new Date();
    appointment.notes = payload?.reason || appointment.notes;
    appointment.updatedBy = actor?.sub || null;
    await appointment.save();

    await auditService.record({
      actor,
      action: "appointment_missed",
      resourceType: "appointment",
      resourceId: appointment.appointmentNumber,
      metadata: { reason: payload?.reason || "" },
    });

    return appointment.toObject();
  },

  async rescheduleAppointment(id, payload, actor) {
    const parsedPayload = rescheduleAppointmentSchema.parse(payload);
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      const error = new Error("Appointment not found");
      error.statusCode = 404;
      throw error;
    }

    appointment.status = "rescheduled";
    appointment.updatedBy = actor?.sub || null;
    await appointment.save();

    const replacement = await this.createAppointment(
      {
        patientId: appointment.patientId,
        doctorId: appointment.doctorRef ? String(appointment.doctorRef) : "",
        doctorName: appointment.doctorName,
        department: appointment.department,
        appointmentDate: parsedPayload.appointmentDate,
        startTime: parsedPayload.startTime,
        endTime: parsedPayload.endTime,
        appointmentType: appointment.appointmentType,
        bookingSource: appointment.bookingSource,
        reason: appointment.reason,
        symptomsSummary: appointment.symptomsSummary,
        priority: appointment.priority,
        notes: parsedPayload.reason || appointment.notes,
      },
      actor,
    );

    appointment.rescheduledTo = replacement._id;
    await appointment.save();

    return { previous: appointment.toObject(), next: replacement };
  },

  async createFollowUp(payload, actor) {
    const parsedPayload = followUpAppointmentSchema.parse(payload);
    return this.createAppointment(
      {
        ...parsedPayload,
        bookingSource: "follow_up",
      },
      actor,
    );
  },
};
