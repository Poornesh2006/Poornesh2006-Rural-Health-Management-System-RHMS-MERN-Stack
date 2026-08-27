import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/rhms"),
  JWT_SECRET: z.string().min(8).default("change-me"),
  JWT_EXPIRES_IN: z.string().min(1).default("1h"),
  JWT_REFRESH_SECRET: z.string().min(8).default("change-refresh-me"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("7d"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  DEFAULT_ADMIN_EMAIL: z.string().email().default("admin@rphc.gov"),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default("Admin@123"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  APP_BASE_URL: z.string().url().default("http://localhost:5000"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default("noreply@rphc.gov"),
  EMAIL_PREVIEW_MODE: z.enum(["true", "false"]).default("true"),
  SMS_PROVIDER: z.enum(["mock", "twilio", "fast2sms"]).default("mock"),
  SMS_FROM: z.string().default("RHMS"),
  SMS_API_KEY: z.string().default(""),
  TWILIO_ACCOUNT_SID: z.string().default(""),
  TWILIO_AUTH_TOKEN: z.string().default(""),
  TWILIO_PHONE_NUMBER: z.string().default(""),
  PUSH_PUBLIC_KEY: z.string().default(""),
  PUSH_PRIVATE_KEY: z.string().default(""),
  PUSH_SUBJECT: z.string().default("mailto:admin@rphc.gov"),
  BACKUP_STORAGE_PATH: z.string().default("./backups"),
  BACKUP_ENCRYPTION_KEY: z.string().default("rhms-demo-backup-key"),
  RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  SESSION_TIMEOUT_MINUTES: z.coerce.number().int().positive().default(30),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
  throw new Error(`Environment validation failed: ${details}`);
}

const source = parsedEnv.data;

export const env = {
  port: source.PORT,
  nodeEnv: source.NODE_ENV,
  mongoUri: source.MONGODB_URI,
  jwtSecret: source.JWT_SECRET,
  jwtExpiresIn: source.JWT_EXPIRES_IN,
  jwtRefreshSecret: source.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: source.JWT_REFRESH_EXPIRES_IN,
  corsOrigin: source.CORS_ORIGIN,
  defaultAdminEmail: source.DEFAULT_ADMIN_EMAIL,
  defaultAdminPassword: source.DEFAULT_ADMIN_PASSWORD,
  logLevel: source.LOG_LEVEL,
  appBaseUrl: source.APP_BASE_URL,
  frontendUrl: source.FRONTEND_URL,
  smtpHost: source.SMTP_HOST,
  smtpPort: source.SMTP_PORT,
  smtpUser: source.SMTP_USER,
  smtpPass: source.SMTP_PASS,
  smtpFrom: source.SMTP_FROM,
  emailPreviewMode: source.EMAIL_PREVIEW_MODE === "true",
  smsProvider: source.SMS_PROVIDER,
  smsFrom: source.SMS_FROM,
  smsApiKey: source.SMS_API_KEY,
  twilioAccountSid: source.TWILIO_ACCOUNT_SID,
  twilioAuthToken: source.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: source.TWILIO_PHONE_NUMBER,
  pushPublicKey: source.PUSH_PUBLIC_KEY,
  pushPrivateKey: source.PUSH_PRIVATE_KEY,
  pushSubject: source.PUSH_SUBJECT,
  backupStoragePath: source.BACKUP_STORAGE_PATH,
  backupEncryptionKey: source.BACKUP_ENCRYPTION_KEY,
  retentionDays: source.RETENTION_DAYS,
  sessionTimeoutMinutes: source.SESSION_TIMEOUT_MINUTES,
};
