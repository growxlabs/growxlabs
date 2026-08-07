import crypto from "crypto";

export function getZoomSdkConfig() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const encryptionKey = process.env.ZOOM_PASSCODE_ENCRYPTION_KEY;
  if (!clientId || !clientSecret || !encryptionKey || encryptionKey.length < 32) return null;
  return { clientId, clientSecret, encryptionKey: crypto.createHash("sha256").update(encryptionKey).digest() };
}

export function encryptZoomPasscode(passcode: string) {
  const config = getZoomSdkConfig();
  if (!config) throw new Error("Zoom server configuration is incomplete.");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", config.encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(passcode, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptZoomPasscode(value: string) {
  const config = getZoomSdkConfig();
  if (!config) throw new Error("Zoom server configuration is incomplete.");
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", config.encryptionKey, Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64url")), decipher.final()]).toString("utf8");
}

export function createZoomSdkSignature(meetingNumber: string, role = 0) {
  const config = getZoomSdkConfig();
  if (!config) throw new Error("Zoom server configuration is incomplete.");
  const issuedAt = Math.floor(Date.now() / 1000) - 30;
  const payload = { appKey: config.clientId, mn: meetingNumber, role, iat: issuedAt, exp: issuedAt + 10 * 60, tokenExp: issuedAt + 10 * 60 };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  const signature = crypto.createHmac("sha256", config.clientSecret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function isValidZoomMeetingNumber(value: string) {
  return /^\d{9,12}$/.test(value.replace(/[\s-]/g, ""));
}
