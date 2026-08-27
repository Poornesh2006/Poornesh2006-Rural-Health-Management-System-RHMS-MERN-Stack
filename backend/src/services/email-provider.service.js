import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let transport;

function getTransport() {
  if (transport) {
    return transport;
  }

  transport = env.smtpHost
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
      })
    : nodemailer.createTransport({
        jsonTransport: true,
      });

  return transport;
}

export const emailProviderService = {
  getStatus() {
    return {
      configured: Boolean(env.smtpHost) || env.emailPreviewMode,
      previewMode: env.emailPreviewMode || !env.smtpHost,
    };
  },

  async send({ to, subject, html, text }) {
    const transporter = getTransport();
    const result = await transporter.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      html,
      text,
    });

    logger.info({
      event: "notification.email.sent",
      previewMode: env.emailPreviewMode || !env.smtpHost,
      messageId: result.messageId,
      envelope: result.envelope,
    });

    return {
      providerMessageId: result.messageId || "",
      preview: result.message?.toString?.() || "",
    };
  },
};
