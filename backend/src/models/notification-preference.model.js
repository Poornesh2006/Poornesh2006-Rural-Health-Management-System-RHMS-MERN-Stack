import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, unique: true, sparse: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
    emailEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: false },
    pushEnabled: { type: Boolean, default: false },
    inAppEnabled: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true },
    followUpReminders: { type: Boolean, default: true },
    labNotifications: { type: Boolean, default: true },
    vaccinationReminders: { type: Boolean, default: true },
    pharmacyNotifications: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    preferredLanguage: { type: String, enum: ["en", "ta"], default: "en" },
    quietHoursStart: { type: String, default: "22:00" },
    quietHoursEnd: { type: String, default: "06:00" },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { timestamps: true },
);

export const NotificationPreference = mongoose.model("NotificationPreference", notificationPreferenceSchema);
