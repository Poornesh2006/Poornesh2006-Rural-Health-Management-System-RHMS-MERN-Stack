import { NotificationTemplate } from "../models/notification-template.model.js";

function sanitizeVariableValue(value) {
  return String(value ?? "").replace(/[<>]/g, "");
}

function renderString(template, variables = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => sanitizeVariableValue(variables[key]));
}

export const notificationTemplateService = {
  async findByCode(templateCode, channel, language = "en") {
    return NotificationTemplate.findOne({
      templateCode,
      channel,
      language,
      activeStatus: true,
    }).lean();
  },

  async render(templateCode, channel, variables = {}, language = "en") {
    const template = await this.findByCode(templateCode, channel, language);
    if (!template) {
      return null;
    }

    return {
      subject: renderString(template.subject || "", variables),
      body: renderString(template.body, variables),
    };
  },
};
