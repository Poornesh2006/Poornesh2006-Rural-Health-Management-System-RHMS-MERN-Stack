import { Notification } from "../models/notification.model.js";
import { PushSubscription } from "../models/push-subscription.model.js";
import { User } from "../models/user.model.js";
import { notificationRepository } from "../repositories/notification.repository.js";
import { generateAuditId } from "../utils/id-generator.js";
import { socketService } from "./socket.service.js";
import { emailProviderService } from "./email-provider.service.js";
import { metricsService } from "./metrics.service.js";
import { notificationPreferenceService } from "./notification-preference.service.js";
import { notificationTemplateService } from "./notification-template.service.js";
import { pushProviderService } from "./push-provider.service.js";
import { smsProviderService } from "./sms-provider.service.js";

function mapLegacyPriority(type = "info") {
  if (type === "danger") return "critical";
  if (type === "warning") return "high";
  return "normal";
}

function buildRooms(notification) {
  const rooms = [];
  if (notification.recipientRole) rooms.push(`role:${notification.recipientRole}`);
  if (notification.recipientUser) rooms.push(`user:${notification.recipientUser}`);
  return rooms;
}

async function loadRecipients(notification) {
  if (notification.recipientUser) {
    const user = await User.findById(notification.recipientUser).lean();
    return user ? [user] : [];
  }

  if (notification.recipientRole) {
    return User.find({ role: notification.recipientRole, isActive: true }).lean();
  }

  return [];
}

async function sendChannel(notification, recipient, channel, preference) {
  if (!notificationPreferenceService.allowsChannel(preference, notification.category, channel)) {
    return { channel, status: "cancelled", failureReason: "Preference disabled" };
  }

  const rendered = notification.templateCode
    ? await notificationTemplateService.render(
        notification.templateCode,
        channel,
        notification.metadata,
        preference.preferredLanguage,
      )
    : null;

  const title = rendered?.subject || notification.title;
  const message = rendered?.body || notification.message;

  if (channel === "email" && recipient.email) {
    const result = await emailProviderService.send({
      to: recipient.email,
      subject: title,
      html: `<p>${message}</p>`,
      text: message,
    });
    return { channel, status: "sent", providerMessageId: result.providerMessageId, deliveredAt: new Date() };
  }

  if (channel === "sms" && recipient.phone) {
    const result = await smsProviderService.send({
      phone: recipient.phone,
      message,
    });
    return { channel, status: "sent", providerMessageId: result.providerMessageId, deliveredAt: new Date() };
  }

  if (channel === "push") {
    const subscriptions = await PushSubscription.find({ user: recipient._id, activeStatus: true }).lean();
    const sent = await pushProviderService.send(notification, subscriptions);
    return {
      channel,
      status: sent.length ? "sent" : "failed",
      providerMessageId: sent[0]?.providerMessageId || "",
      deliveredAt: sent.length ? new Date() : null,
      failureReason: sent.length ? "" : "No active push subscriptions",
    };
  }

  return { channel: "in_app", status: "delivered", deliveredAt: new Date() };
}

export const notificationService = {
  async create(payload) {
    const normalizedPayload = {
      notificationNumber: payload.notificationNumber || generateAuditId("NTF"),
      recipientUser: payload.recipientUser || null,
      recipientPatient: payload.recipientPatient || null,
      recipientRole: payload.recipientRole || payload.audienceRole || "",
      category: payload.category || "system",
      title: payload.title,
      message: payload.message || payload.description,
      priority: payload.priority || mapLegacyPriority(payload.type),
      channels: payload.channels?.length ? payload.channels : ["in_app"],
      status: payload.scheduledFor ? "queued" : "sent",
      relatedEntityType: payload.relatedEntityType || payload.entityType || "",
      relatedEntityId: payload.relatedEntityId || payload.entityId || "",
      actionUrl: payload.actionUrl || "",
      templateCode: payload.templateCode || "",
      scheduledFor: payload.scheduledFor || null,
      metadata: payload.metadata || {},
      createdBy: payload.createdBy || null,
    };

    const notification = await notificationRepository.create(normalizedPayload);
    socketService.emit("notification:created", notification, buildRooms(notification));

    if (!normalizedPayload.scheduledFor) {
      await this.dispatch(notification._id);
    }

    return Notification.findById(notification._id).lean();
  },

  async dispatch(notificationId) {
    const notification = await Notification.findById(notificationId).lean();
    if (!notification) {
      return null;
    }

    const recipients = await loadRecipients(notification);
    const deliveries = [];

    try {
      for (const recipient of recipients) {
        const preference = await notificationPreferenceService.getForUser(recipient._id);
        for (const channel of notification.channels) {
          const delivery = await sendChannel(notification, recipient, channel, preference);
          deliveries.push({
            ...delivery,
            attempts: 1,
            failedAt: delivery.status === "failed" ? new Date() : null,
          });
        }
      }

      const failed = deliveries.find((item) => item.status === "failed");
      const updated = await notificationRepository.updateDelivery(notificationId, {
        deliveries,
        status: failed ? "failed" : "delivered",
        sentAt: new Date(),
        deliveredAt: failed ? null : new Date(),
        failedAt: failed ? new Date() : null,
        failureReason: failed?.failureReason || "",
      });

      if (failed) {
        metricsService.increment("notificationFailures");
      }

      socketService.emit("notification:updated", updated, buildRooms(updated));
      return updated;
    } catch (error) {
      metricsService.increment("notificationFailures");
      return notificationRepository.updateDelivery(notificationId, {
        status: "failed",
        failedAt: new Date(),
        failureReason: error.message,
      });
    }
  },

  async dispatchDueScheduled() {
    const due = await notificationRepository.findDueScheduled();
    await Promise.all(due.map((item) => this.dispatch(item._id)));
    return due.length;
  },

  async listForUser(user, filters) {
    const result = await notificationRepository.listForUser(user, filters);
    const unreadCount = await notificationRepository.countUnread(user);
    return {
      ...result,
      unreadCount,
    };
  },

  async markAsRead(user, id) {
    return notificationRepository.markAsRead(user, id);
  },

  async markAllAsRead(user) {
    await notificationRepository.markAllAsRead(user);
    return { success: true };
  },
};
