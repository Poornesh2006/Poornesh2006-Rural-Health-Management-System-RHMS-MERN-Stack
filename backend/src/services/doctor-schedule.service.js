import { doctorScheduleRepository } from "../repositories/doctor-schedule.repository.js";
import { createDoctorScheduleSchema, listAvailableSlotsSchema } from "../validators/doctor-schedule.validator.js";
import { timeToMinutes, minutesToTime, getDayName } from "../utils/time.js";
import { appointmentRepository } from "../repositories/appointment.repository.js";

function isDateBlocked(date, blockedDates = []) {
  const target = new Date(date).toDateString();
  return blockedDates.some((entry) => new Date(entry).toDateString() === target);
}

export const doctorScheduleService = {
  async upsertSchedule(payload) {
    const parsedPayload = createDoctorScheduleSchema.parse(payload);

    return doctorScheduleRepository.upsertByDoctor(parsedPayload.doctorId, {
      doctorRef: parsedPayload.doctorId,
      ...parsedPayload,
      unavailableDates: parsedPayload.unavailableDates.map((value) => new Date(value)),
      leaveDates: parsedPayload.leaveDates.map((value) => new Date(value)),
    });
  },

  async getAvailableSlots(query) {
    const parsedQuery = listAvailableSlotsSchema.parse(query);
    const schedule = await doctorScheduleRepository.findByDoctor(parsedQuery.doctorId);

    if (!schedule || !schedule.activeStatus) {
      return [];
    }

    const dayName = getDayName(parsedQuery.date);
    if (!schedule.workingDays.includes(dayName)) {
      return [];
    }

    if (isDateBlocked(parsedQuery.date, schedule.leaveDates) || isDateBlocked(parsedQuery.date, schedule.unavailableDates)) {
      return [];
    }

    const existingAppointments = await appointmentRepository.findDoctorDayAppointments(parsedQuery.doctorId, parsedQuery.date);
    const occupiedStarts = new Set(existingAppointments.map((item) => item.startTime));

    const slots = [];
    const shiftStartMinutes = timeToMinutes(schedule.shiftStart);
    const shiftEndMinutes = timeToMinutes(schedule.shiftEnd);

    for (let minute = shiftStartMinutes; minute + schedule.slotDuration <= shiftEndMinutes; minute += schedule.slotDuration) {
      const start = minutesToTime(minute);
      const end = minutesToTime(minute + schedule.slotDuration);

      const inBreak = schedule.breakPeriods.some(
        (period) => minute >= timeToMinutes(period.start) && minute < timeToMinutes(period.end),
      );

      if (inBreak || occupiedStarts.has(start)) {
        continue;
      }

      slots.push({ startTime: start, endTime: end });
    }

    return slots.slice(0, schedule.maximumAppointments);
  },
};
