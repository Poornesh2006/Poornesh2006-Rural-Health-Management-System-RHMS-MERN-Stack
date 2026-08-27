import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    endpointHash: { type: String, required: true, unique: true, index: true },
    endpoint: { type: String, required: true },
    subscription: { type: mongoose.Schema.Types.Mixed, required: true },
    userAgent: { type: String, default: "" },
    lastUsedAt: { type: Date, default: Date.now },
    activeStatus: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);
