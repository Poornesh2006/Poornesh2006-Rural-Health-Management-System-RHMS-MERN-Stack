import { doctorScheduleService } from "../services/doctor-schedule.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function upsertDoctorSchedule(request, response, next) {
  try {
    const schedule = await doctorScheduleService.upsertSchedule(request.body);
    response.json(apiResponse("Doctor schedule saved successfully", schedule));
  } catch (error) {
    next(error);
  }
}

export async function getAvailableSlots(request, response, next) {
  try {
    const slots = await doctorScheduleService.getAvailableSlots(request.query);
    response.json(apiResponse("Available slots fetched successfully", slots));
  } catch (error) {
    next(error);
  }
}
