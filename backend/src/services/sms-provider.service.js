import { env } from "../config/env.js";

function isIndianMobileNumber(phone) {
  return /^(\+91)?[6-9]\d{9}$/.test(String(phone || "").replace(/\s+/g, ""));
}

export const smsProviderService = {
  getStatus() {
    return {
      provider: env.smsProvider,
      configured:
        env.smsProvider === "mock"
          || (env.smsProvider === "fast2sms" && Boolean(env.smsApiKey))
          || (env.smsProvider === "twilio" && Boolean(env.twilioAccountSid && env.twilioAuthToken && env.twilioPhoneNumber)),
    };
  },

  async send({ phone, message }) {
    if (!isIndianMobileNumber(phone)) {
      const error = new Error("Phone number is not a valid Indian mobile number");
      error.statusCode = 400;
      throw error;
    }

    return {
      providerMessageId: `${env.smsProvider}-${Date.now()}`,
      preview: message,
    };
  },
};
