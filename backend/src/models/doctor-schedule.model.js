import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    workingDays: [{ type: String }],
    shiftStart: { type: String, required: true },
    shiftEnd: { type: String, required: true },
    breakPeriods: [{ start: String, end: String }],
    slotDuration: { type: Number, default: 15 },
    maximumAppointments: { type: Number, default: 24 },
    department: { type: String, required: true },
    consultationRoom: { type: String, default: "" },
    unavailableDates: [{ type: Date }],
    leaveDates: [{ type: Date }],
    activeStatus: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const DoctorSchedule = mongoose.model("DoctorSchedule", doctorScheduleSchema);
