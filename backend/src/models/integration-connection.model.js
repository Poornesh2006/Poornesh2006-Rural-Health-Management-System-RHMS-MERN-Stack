import mongoose from "mongoose";

const integrationConnectionSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, unique: true, index: true },
    environment: { type: String, enum: ["sandbox", "production"], default: "sandbox" },
    enabledStatus: { type: Boolean, default: false },
    lastSuccessfulRequest: { type: Date, default: null },
    lastFailedRequest: { type: Date, default: null },
    errorCategory: { type: String, default: "" },
    retryCount: { type: Number, default: 0 },
    queueDepth: { type: Number, default: 0 },
    credentialExpiryWarningAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const IntegrationConnection = mongoose.model("IntegrationConnection", integrationConnectionSchema);
