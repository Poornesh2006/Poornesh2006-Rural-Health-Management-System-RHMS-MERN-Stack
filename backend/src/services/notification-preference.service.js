import { NotificationPreference } from "../models/notification-preference.model.js";

function createDefaultPreference(userId) {
  return {
    user: userId,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    inAppEnabled: true,
    appointmentReminders: true,
    followUpReminders: true,
    labNotifications: true,
    vaccinationReminders: true,
    pharmacyNotifications: true,
    securityAlerts: true,
    preferredLanguage: "en",
    quietHoursStart: "22:00",
    quietHoursEnd: "06:00",
    timezone: "Asia/Kolkata",
  };
}

function categoryToPreferenceKey(category) {
  const mapping = {
    appointment: "appointmentReminders",
    follow_up: "followUpReminders",
    laboratory: "labNotifications",
    vaccination: "vaccinationReminders",
    pharmacy: "pharmacyNotifications",
    security: "securityAlerts",
  };

  return mapping[category] || null;
}

export const notificationPreferenceService = {
  async getForUser(userId) {
    let preference = await NotificationPreference.findOne({ user: userId }).lean();

    if (!preference) {
      preference = await NotificationPreference.create(createDefaultPreference(userId)).then((item) => item.toObject());
    }

    return preference;
  },

  async updateForUser(userId, payload) {
    const current = await this.getForUser(userId);

    return NotificationPreference.findOneAndUpdate(
      { user: userId },
      { ...current, ...payload, user: userId },
      { new: true, upsert: true },
    ).lean();
  },

  allowsChannel(preference, category, channel) {
    const categoryKey = categoryToPreferenceKey(category);
    const channelEnabled =
      channel === "email"
        ? preference.emailEnabled
        : channel === "sms"
          ? preference.smsEnabled
          : channel === "push"
            ? preference.pushEnabled
            : preference.inAppEnabled;

    if (!channelEnabled) {
      return false;
    }

    if (!categoryKey) {
      return true;
    }

    return Boolean(preference[categoryKey]);
  },
};
