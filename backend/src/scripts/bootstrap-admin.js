// One-time operator command. It never runs as part of normal API startup.
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ROLES } from "../constants/roles.js";
import { User } from "../models/user.model.js";

const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;
const fullName = process.env.INITIAL_ADMIN_NAME?.trim() || "RHMS Administrator";

async function bootstrapAdmin() {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("INITIAL_ADMIN_EMAIL must be a valid email address.");
  }
  if (!password || password.length < 12) {
    throw new Error("INITIAL_ADMIN_PASSWORD must contain at least 12 characters.");
  }

  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`An account already exists for ${email}; no changes were made.`);
    return;
  }

  await User.create({
    fullName,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: ROLES.ADMIN,
    phone: "",
    isActive: true,
  });
  console.log(`Administrator account created for ${email}.`);
}

bootstrapAdmin()
  .catch((error) => { console.error(`Administrator bootstrap failed: ${error.message}`); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
