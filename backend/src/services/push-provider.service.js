import { createSha256Hash } from "../utils/security.js";
import { PushSubscription } from "../models/push-subscription.model.js";

export const pushProviderService = {
  async subscribe(userId, subscription, userAgent = "") {
    const endpointHash = createSha256Hash(subscription?.endpoint || "");
    return PushSubscription.findOneAndUpdate(
      { endpointHash },
      {
        user: userId,
        endpointHash,
        endpoint: subscription.endpoint,
        subscription,
        userAgent,
        lastUsedAt: new Date(),
        activeStatus: true,
      },
      { new: true, upsert: true },
    ).lean();
  },

  async unsubscribe(userId, endpointHash) {
    await PushSubscription.findOneAndUpdate(
      { user: userId, endpointHash },
      { activeStatus: false },
    );

    return { success: true };
  },

  async listForUser(userId) {
    return PushSubscription.find({ user: userId, activeStatus: true }).lean();
  },

  async send(_notification, subscriptions) {
    return subscriptions.map((item) => ({
      endpointHash: item.endpointHash,
      providerMessageId: `push-${item.endpointHash.slice(0, 10)}`,
    }));
  },
};
