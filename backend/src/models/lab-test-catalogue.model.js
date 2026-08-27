import mongoose from "mongoose";

const labParameterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, default: "", trim: true },
    referenceRange: { type: String, default: "", trim: true },
    valueType: { type: String, enum: ["number", "text", "boolean", "dropdown"], default: "number" },
    options: [{ type: String }],
  },
  { _id: false },
);

const labTestCatalogueSchema = new mongoose.Schema(
  {
    testCode: { type: String, required: true, unique: true, index: true },
    testName: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: ["hematology", "biochemistry", "microbiology", "pathology", "urine", "serology", "imaging", "cardiology", "other"],
      default: "other",
    },
    specimenType: { type: String, default: "", trim: true },
    unit: { type: String, default: "", trim: true },
    referenceRange: { type: String, default: "", trim: true },
    preparationInstructions: { type: String, default: "", trim: true },
    estimatedCompletionTime: { type: Number, default: 24, min: 0 },
    activeStatus: { type: Boolean, default: true, index: true },
    defaultPrice: { type: Number, default: 0, min: 0 },
    parameters: { type: [labParameterSchema], default: [] },
  },
  { timestamps: true },
);

labTestCatalogueSchema.index({ testCode: "text", testName: "text", category: "text" });

export const LabTestCatalogue = mongoose.model("LabTestCatalogue", labTestCatalogueSchema);
