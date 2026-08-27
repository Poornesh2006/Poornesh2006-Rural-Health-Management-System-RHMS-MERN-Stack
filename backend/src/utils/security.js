import crypto from "crypto";

export function createSha256Hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}
