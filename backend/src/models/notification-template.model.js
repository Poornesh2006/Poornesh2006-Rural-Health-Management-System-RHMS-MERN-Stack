import mongoose from "mongoose";

const notificationTemplateSchema = new mongoose.Schema(
  {
    templateCode: { type: String, required: true },
    category: { type: String, required: true },
    channel: { type: String, enum: ["in_app", "email", "sms", "push"], required: true },
    language: { type: String, enum: ["en", "ta"], default: "en" },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    variables: [{ type: String }],
    activeStatus: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);

notificationTemplateSchema.index(
  { templateCode: 1, channel: 1, language: 1 },
  { unique: true },
);

export const NotificationTemplate = mongoose.model("NotificationTemplate", notificationTemplateSchema);
