import pino from "pino";
import { env } from "./env.js";

const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.currentPassword",
  "req.body.newPassword",
  "req.body.refreshToken",
  "req.body.token",
  "req.body.aadhaar",
  "res.headers['set-cookie']",
];

export const logger = pino({
  name: "rhms-backend",
  level: env.logLevel,
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },
});
