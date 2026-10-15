import crypto from "crypto";

/**
 * Generates a cryptographically secure 6-digit numeric OTP code.
 */
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hashes an OTP code using SHA-256 with whitespace trimming.
 */
export function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

/**
 * Timing-safe comparison of two hash strings.
 */
export function verifyOtpHash(storedHash: string, inputCode: string): boolean {
  const inputHash = hashOtp(inputCode);
  const stored = String(storedHash || "").trim();
  if (stored.length !== inputHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(inputHash));
}

/**
 * Checks whether an OTP has expired based on ISO timestamp string.
 */
export function isOtpExpired(expiresAt: string, nowMs = Date.now()): boolean {
  const expiry = new Date(expiresAt).getTime();
  return Number.isNaN(expiry) || nowMs > expiry;
}
