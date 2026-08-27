import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ["in_app", "email", "sms", "push"],
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "sent", "delivered", "read", "failed", "cancelled"],
      default: "queued",
    },
    providerMessageId: { type: String, default: "" },
    deliveredAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    failureReason: { type: String, default: "" },
    attempts: { type: Number, default: 0 },
  },
  { _id: false },
);

const notificationSchema = new mongoose.Schema(
  {
    notificationNumber: { type: String, required: true, unique: true, index: true },
    recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    recipientPatient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null, index: true },
    recipientRole: { type: String, default: "", index: true },
    category: {
      type: String,
      enum: ["appointment", "queue", "follow_up", "pharmacy", "laboratory", "vaccination", "stock", "system", "security", "emergency", "administrative"],
      default: "system",
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal",
      index: true,
    },
    channels: [{ type: String, enum: ["in_app", "email", "sms", "push"] }],
    status: {
      type: String,
      enum: ["queued", "sent", "delivered", "read", "failed", "cancelled"],
      default: "queued",
      index: true,
    },
    deliveries: [deliverySchema],
    relatedEntityType: { type: String, default: "" },
    relatedEntityId: { type: String, default: "" },
    actionUrl: { type: String, default: "" },
    templateCode: { type: String, default: "" },
    scheduledFor: { type: Date, default: null, index: true },
    sentAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    failureReason: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientUser: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
