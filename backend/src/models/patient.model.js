import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCodeValue: { type: String, required: true },
    photoUrl: { type: String, default: "" },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true, index: true },
    dateOfBirth: {
      type: Date,
    },
    age: { type: Number, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    email: { type: String, trim: true, lowercase: true, default: "" },
    address: {
      village: { type: String, default: "", index: true },
      district: { type: String, default: "" },
      state: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },
    guardianName: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    occupation: { type: String, default: "" },
    insurance: { type: String, default: "" },
    disability: { type: String, default: "" },
    medicalFlags: {
      medicalHistory: [{ type: String }],
      allergies: [{ type: String }],
      chronicDiseases: [{ type: String }],
      currentMedications: [{ type: String }],
    },
    vitals: {
      heightCm: { type: Number, default: null },
      weightKg: { type: Number, default: null },
      bmi: { type: Number, default: null },
    },
    documents: [{ label: String, url: String, fileType: String }],
    organizationRef: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    facilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    homeFacilityRef: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null, index: true },
    status: {
      type: String,
      default: "active",
      enum: ["active", "archived", "inactive"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    archivedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
  },
);

patientSchema.index({ phone: 1, deletedAt: 1 });
patientSchema.index({ createdAt: -1, deletedAt: 1 });
patientSchema.index({ facilityRef: 1, createdAt: -1, deletedAt: 1 });
patientSchema.index({ fullName: "text", patientId: "text", phone: "text", aadhaarNumber: "text", "address.village": "text" });

export const Patient = mongoose.model("Patient", patientSchema);
