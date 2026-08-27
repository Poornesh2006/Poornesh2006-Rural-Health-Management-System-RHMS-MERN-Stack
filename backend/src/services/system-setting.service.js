import { SystemSetting } from "../models/system-setting.model.js";

const DEFAULT_SETTINGS = {
  phcProfile: {
    name: "Rural PHC",
    address: "Village Road, Tamil Nadu",
    contactEmail: "admin@rphc.gov",
    contactPhone: "9876543210",
    workingHours: "09:00 - 16:00",
    logoUrl: "",
  },
  departments: ["General OP", "Pharmacy", "Laboratory", "Vaccination"],
  tokenPrefixes: {
    general: "G",
    emergency: "E",
    vaccination: "V",
  },
  languageDefaults: {
    defaultLanguage: "en",
    supportedLanguages: ["en", "ta"],
    dateFormat: "en-IN",
  },
  notificationDefaults: {
    channels: ["in_app", "email"],
    reminderIntervalsHours: [24, 2],
  },
  offlinePolicy: {
    cacheDays: 7,
    allowDraftCapture: true,
  },
  backupSettings: {
    frequency: "weekly",
    retentionDays: 30,
  },
  securityPolicy: {
    passwordMinLength: 8,
    sessionTimeoutMinutes: 30,
    lockoutThreshold: 5,
  },
  accessibilityDefaults: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  },
};

export const systemSettingService = {
  async getSettings() {
    const existing = await SystemSetting.findOne({ key: "system" }).lean();

    if (existing) {
      return existing.value;
    }

    await SystemSetting.create({ key: "system", value: DEFAULT_SETTINGS });
    return DEFAULT_SETTINGS;
  },

  async updateSettings(payload, userId) {
    const current = await this.getSettings();
    const value = {
      ...current,
      ...payload,
    };

    const updated = await SystemSetting.findOneAndUpdate(
      { key: "system" },
      { key: "system", value, updatedBy: userId },
      { new: true, upsert: true },
    ).lean();

    return updated.value;
  },
};
