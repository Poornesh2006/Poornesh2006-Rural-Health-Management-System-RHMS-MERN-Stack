import { notificationService } from "../services/notification.service.js";
import { notificationPreferenceService } from "../services/notification-preference.service.js";
import { pushProviderService } from "../services/push-provider.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function listNotifications(request, response, next) {
  try {
    const result = await notificationService.listForUser(request.user, request.query);
    response.json(apiResponse("Notifications fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(request, response, next) {
  try {
    const result = await notificationService.markAsRead(request.user, request.params.notificationId);
    response.json(apiResponse("Notification marked as read", result));
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(request, response, next) {
  try {
    const result = await notificationService.markAllAsRead(request.user);
    response.json(apiResponse("All notifications marked as read", result));
  } catch (error) {
    next(error);
  }
}

export async function getNotificationPreferences(request, response, next) {
  try {
    const result = await notificationPreferenceService.getForUser(request.user.sub);
    response.json(apiResponse("Notification preferences fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function updateNotificationPreferences(request, response, next) {
  try {
    const result = await notificationPreferenceService.updateForUser(request.user.sub, request.body);
    response.json(apiResponse("Notification preferences updated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function createPushSubscription(request, response, next) {
  try {
    const result = await pushProviderService.subscribe(request.user.sub, request.body.subscription, request.get("user-agent"));
    response.json(apiResponse("Push subscription stored successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function deletePushSubscription(request, response, next) {
  try {
    const result = await pushProviderService.unsubscribe(request.user.sub, request.params.endpointHash);
    response.json(apiResponse("Push subscription removed successfully", result));
  } catch (error) {
    next(error);
  }
}
