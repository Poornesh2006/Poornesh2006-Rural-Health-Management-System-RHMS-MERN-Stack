import { z } from "zod";
import { ROLES } from "../constants/roles.js";

const roleValues = Object.values(ROLES);

export const createUserSchema = z.object({
  fullName: z.string().min(3).max(120),
  email: z.string().email(),
  phone: z.string().min(10).max(15).optional().or(z.literal("")),
  password: z.string().min(8).regex(/[A-Z]/, "Password must contain an uppercase letter").regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(roleValues),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  isActive: z.boolean().optional(),
});
