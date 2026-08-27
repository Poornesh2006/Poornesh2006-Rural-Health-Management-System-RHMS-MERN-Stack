import { appointmentService } from "../services/appointment.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function createAppointment(request, response, next) {
  try {
    const appointment = await appointmentService.createAppointment(request.body, request.user);
    response.status(201).json(apiResponse("Appointment created successfully", appointment));
  } catch (error) {
    next(error);
  }
}

export async function listAppointments(request, response, next) {
  try {
    const appointments = await appointmentService.listAppointments(request.query);
    response.json(apiResponse("Appointments fetched successfully", appointments));
  } catch (error) {
    next(error);
  }
}

export async function getAppointmentById(request, response, next) {
  try {
    const appointment = await appointmentService.getAppointmentById(request.params.appointmentId);
    response.json(apiResponse("Appointment fetched successfully", appointment));
  } catch (error) {
    next(error);
  }
}

export async function confirmAppointment(request, response, next) {
  try {
    const appointment = await appointmentService.confirmAppointment(request.params.appointmentId, request.user);
    response.json(apiResponse("Appointment confirmed successfully", appointment));
  } catch (error) {
    next(error);
  }
}

export async function checkInAppointment(request, response, next) {
  try {
    const result = await appointmentService.checkInAppointment(request.params.appointmentId, request.body, request.user);
    response.json(apiResponse("Appointment checked in successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function cancelAppointment(request, response, next) {
  try {
    const appointment = await appointmentService.cancelAppointment(request.params.appointmentId, request.body, request.user);
    response.json(apiResponse("Appointment cancelled successfully", appointment));
  } catch (error) {
    next(error);
  }
}

export async function markMissedAppointment(request, response, next) {
  try {
    const appointment = await appointmentService.markMissed(request.params.appointmentId, request.body, request.user);
    response.json(apiResponse("Appointment marked missed successfully", appointment));
  } catch (error) {
    next(error);
  }
}

export async function rescheduleAppointment(request, response, next) {
  try {
    const result = await appointmentService.rescheduleAppointment(request.params.appointmentId, request.body, request.user);
    response.json(apiResponse("Appointment rescheduled successfully", result));
  } catch (error) {
    next(error);
  }
}
