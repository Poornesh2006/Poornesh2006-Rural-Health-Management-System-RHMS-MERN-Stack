import mongoose from "mongoose";

const handoverCommentSchema = new mongoose.Schema(
  {
    authorRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    authorName: { type: String, default: "" },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const shiftHandoverSchema = new mongoose.Schema(
  {
    handoverNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    handoverNote: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium", index: true },
    assignedPerson: { type: String, default: "" },
    expectedAction: { type: String, default: "" },
    dueTime: { type: Date, default: null },
    outgoingStaffRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    outgoingStaffName: { type: String, default: "" },
    incomingStaffRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    incomingStaffName: { type: String, default: "" },
    status: { type: String, enum: ["open", "acknowledged", "resolved"], default: "open", index: true },
    module: { type: String, default: "operations" },
    relatedRecordId: { type: String, default: "" },
    comments: [handoverCommentSchema],
    acknowledgedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const ShiftHandover = mongoose.model("ShiftHandover", shiftHandoverSchema);
