import { Router } from "express";
import {
  createPushSubscription,
  deletePushSubscription,
  getNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "../../controllers/notification.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/", listNotifications);
notificationRouter.post("/read-all", markAllNotificationsRead);
notificationRouter.patch("/:notificationId/read", markNotificationRead);
notificationRouter.get("/preferences/me", getNotificationPreferences);
notificationRouter.put("/preferences/me", updateNotificationPreferences);
notificationRouter.post("/push-subscriptions", createPushSubscription);
notificationRouter.delete("/push-subscriptions/:endpointHash", deletePushSubscription);
