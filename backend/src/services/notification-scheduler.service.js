import { logger } from "../config/logger.js";
import { notificationService } from "./notification.service.js";

let intervalHandle;

export const notificationSchedulerService = {
  start() {
    if (intervalHandle) {
      return;
    }

    intervalHandle = setInterval(async () => {
      try {
        const dispatched = await notificationService.dispatchDueScheduled();
        if (dispatched > 0) {
          logger.info({ dispatched }, "Dispatched scheduled notifications");
        }
      } catch (error) {
        logger.error({ error }, "Failed to dispatch scheduled notifications");
      }
    }, 60 * 1000);
  },
};
