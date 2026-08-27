import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    address: {
      line1: { type: String, default: "", trim: true },
      line2: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      pinCode: { type: String, default: "", trim: true },
    },
    gstNumber: { type: String, default: "", trim: true },
    licenseNumber: { type: String, default: "", trim: true },
    activeStatus: { type: Boolean, default: true, index: true },
    medicinesSupplied: [{ type: mongoose.Schema.Types.ObjectId, ref: "Medicine" }],
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

supplierSchema.index({ name: "text", supplierCode: "text", contactPerson: "text" });

export const Supplier = mongoose.model("Supplier", supplierSchema);
