import mongoose from "mongoose";

const savedReportSchema = new mongoose.Schema(
  {
    reportName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    ownerId: { type: String, required: true, index: true },
    ownerRole: { type: String, required: true, index: true },
    visibility: { type: String, enum: ["private", "role", "organization"], default: "private" },
    module: { type: String, required: true, index: true },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    columns: [{ type: String }],
    grouping: { type: String, default: "" },
    sorting: {
      field: { type: String, default: "" },
      direction: { type: String, enum: ["asc", "desc"], default: "desc" },
    },
    chartType: { type: String, default: "table" },
    exportFormat: { type: String, enum: ["pdf", "xlsx", "csv"], default: "pdf" },
  },
  { timestamps: true },
);

savedReportSchema.index({ ownerId: 1, module: 1, updatedAt: -1 });

export const SavedReport = mongoose.model("SavedReport", savedReportSchema);
