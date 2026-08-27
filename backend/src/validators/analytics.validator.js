import { z } from "zod";

export const dateRangePresetValues = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_quarter",
  "this_year",
  "custom",
];

export const ageGroupValues = ["0-5", "6-12", "13-17", "18-30", "31-45", "46-60", "61+"];

export const comparisonValues = ["none", "previous_period", "previous_month", "previous_year"];

export const analyticsFilterSchema = z.object({
  preset: z.enum(dateRangePresetValues).optional().default("this_month"),
  from: z.string().optional(),
  to: z.string().optional(),
  comparison: z.enum(comparisonValues).optional().default("none"),
  department: z.string().optional(),
  doctorId: z.string().optional(),
  village: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  ageGroup: z.enum(ageGroupValues).optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const reportModuleValues = [
  "patients",
  "visits",
  "appointments",
  "queue",
  "prescriptions",
  "pharmacy_stock",
  "lab_requests",
  "lab_results",
  "vaccinations",
  "follow_ups",
  "audit_logs",
];

export const reportPreviewSchema = analyticsFilterSchema.extend({
  module: z.enum(reportModuleValues),
  fields: z.array(z.string()).min(1),
  grouping: z.string().optional().default(""),
  sortingField: z.string().optional().default(""),
  sortingDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  chartType: z.enum(["table", "bar", "line", "donut"]).optional().default("table"),
});

export const reportExportSchema = reportPreviewSchema.extend({
  exportFormat: z.enum(["pdf", "xlsx", "csv"]).default("pdf"),
  reportTitle: z.string().optional().default("RHMS Report"),
});

export const savedReportSchema = z.object({
  reportName: z.string().min(2),
  description: z.string().optional().default(""),
  visibility: z.enum(["private", "role", "organization"]).default("private"),
  module: z.enum(reportModuleValues),
  filters: z.record(z.any()).default({}),
  columns: z.array(z.string()).min(1),
  grouping: z.string().optional().default(""),
  sorting: z.object({
    field: z.string().optional().default(""),
    direction: z.enum(["asc", "desc"]).default("desc"),
  }).optional().default({ field: "", direction: "desc" }),
  chartType: z.string().optional().default("table"),
  exportFormat: z.enum(["pdf", "xlsx", "csv"]).default("pdf"),
});
