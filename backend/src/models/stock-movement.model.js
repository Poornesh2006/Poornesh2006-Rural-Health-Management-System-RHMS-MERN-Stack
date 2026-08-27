import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    medicineRef: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true, index: true },
    batchRef: { type: mongoose.Schema.Types.ObjectId, ref: "MedicineBatch", default: null, index: true },
    movementType: {
      type: String,
      enum: ["purchase", "dispensing", "return", "adjustment", "damaged", "expired", "transfer_in", "transfer_out", "recall"],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    quantityBefore: { type: Number, required: true, min: 0 },
    quantityAfter: { type: Number, required: true, min: 0 },
    referenceType: { type: String, default: "", trim: true },
    referenceId: { type: String, default: "", trim: true, index: true },
    reason: { type: String, default: "", trim: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const StockMovement = mongoose.model("StockMovement", stockMovementSchema);
