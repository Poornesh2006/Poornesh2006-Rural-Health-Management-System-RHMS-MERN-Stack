import { Notification } from "../models/notification.model.js";

function buildRecipientQuery(user) {
  return {
    $or: [{ recipientUser: user.sub }, { recipientRole: user.role }],
  };
}

export const notificationRepository = {
  async create(payload) {
    const notification = await Notification.create(payload);
    return notification.toObject();
  },

  async listForUser(user, filters = {}) {
    const page = Number(filters.page || 1);
    const limit = Math.min(Number(filters.limit || 10), 50);
    const query = {
      ...buildRecipientQuery(user),
    };

    if (filters.status === "unread") {
      query.readAt = null;
    } else if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    const [items, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async markAsRead(user, id) {
    return Notification.findOneAndUpdate(
      { _id: id, ...buildRecipientQuery(user) },
      { status: "read", readAt: new Date() },
      { new: true },
    ).lean();
  },

  async markAllAsRead(user) {
    return Notification.updateMany(
      { ...buildRecipientQuery(user), readAt: null },
      { status: "read", readAt: new Date() },
    );
  },

  async countUnread(user) {
    return Notification.countDocuments({
      ...buildRecipientQuery(user),
      readAt: null,
    });
  },

  async findDueScheduled(now = new Date()) {
    return Notification.find({
      status: "queued",
      scheduledFor: { $lte: now },
    }).lean();
  },

  async updateDelivery(id, patch) {
    return Notification.findByIdAndUpdate(id, patch, { new: true }).lean();
  },
};
