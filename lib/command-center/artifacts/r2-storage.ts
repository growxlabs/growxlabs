import "server-only";

import crypto from "crypto";

import { CommandCenterError } from "../production/errors";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

export class R2StorageService {
  static buildObjectKey(organisationId: string, workspaceId: string, artifactId: string, filename: string): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const safeFilename = filename.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 180);
    return `prod/${encodeSegment(organisationId)}/${encodeSegment(workspaceId)}/${year}/${month}/${encodeSegment(artifactId)}/${safeFilename}`;
  }

  static async upload(
    objectKey: string,
    body: Buffer,
    contentType: string,
    checksum: string,
    signal?: AbortSignal,
  ): Promise<void> {
    const response = await this.signedRequest("PUT", objectKey, {
      body,
      contentType,
      checksum,
      signal,
    });
    if (!response.ok) {
      throw new CommandCenterError("STORAGE_FAILURE", {
        message: "Artifact storage upload failed.",
        retryable: response.status >= 500 || response.status === 429,
      });
    }
  }

  static async delete(objectKey: string, signal?: AbortSignal): Promise<void> {
    const response = await this.signedRequest("DELETE", objectKey, { signal });
    if (!response.ok && response.status !== 404) {
      throw new CommandCenterError("STORAGE_FAILURE", {
        message: "Artifact storage deletion failed.",
        retryable: response.status >= 500 || response.status === 429,
      });
    }
  }

  static generateSignedDownloadUrl(objectKey: string, expiresInSeconds = 300): string {
    const config = this.config();
    const expires = Math.min(900, Math.max(30, expiresInSeconds));
    const now = new Date();
    const amzDate = awsDate(now);
    const dateStamp = amzDate.slice(0, 8);
    const scope = `${dateStamp}/auto/s3/aws4_request`;
    const host = `${config.accountId}.r2.cloudflarestorage.com`;
    const path = `/${encodeSegment(config.bucket)}/${encodeKey(objectKey)}`;
    const params = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${config.accessKeyId}/${scope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expires),
      "X-Amz-SignedHeaders": "host",
    });
    const canonicalQuery = canonicalSearch(params);
    const canonicalRequest = ["GET", path, canonicalQuery, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      scope,
      sha256(canonicalRequest),
    ].join("\n");
    params.set("X-Amz-Signature", hmacHex(signingKey(config.secretAccessKey, dateStamp), stringToSign));
    return `https://${host}${path}?${canonicalSearch(params)}`;
  }

  static async readiness(signal?: AbortSignal): Promise<boolean> {
    try {
      const response = await this.signedRequest("HEAD", "", { signal });
      return response.ok;
    } catch {
      return false;
    }
  }

  private static config(): R2Config {
    const config = {
      accountId: process.env.R2_ACCOUNT_ID ?? "",
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      bucket: process.env.R2_BUCKET_NAME ?? "",
    };
    if (Object.values(config).some((value) => !value)) {
      throw new CommandCenterError("STORAGE_FAILURE", {
        message: "Artifact storage is not configured.",
        retryable: false,
      });
    }
    return config;
  }

  private static async signedRequest(
    method: "PUT" | "DELETE" | "HEAD",
    objectKey: string,
    options: { body?: Buffer; contentType?: string; checksum?: string; signal?: AbortSignal },
  ): Promise<Response> {
    const config = this.config();
    const now = new Date();
    const amzDate = awsDate(now);
    const dateStamp = amzDate.slice(0, 8);
    const host = `${config.accountId}.r2.cloudflarestorage.com`;
    const path = objectKey
      ? `/${encodeSegment(config.bucket)}/${encodeKey(objectKey)}`
      : `/${encodeSegment(config.bucket)}`;
    const payloadHash = options.body ? sha256(options.body) : sha256("");
    const headerValues: Record<string, string> = {
      host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    };
    if (options.contentType) headerValues["content-type"] = options.contentType;
    if (options.checksum) headerValues["x-amz-meta-sha256"] = options.checksum.replace(/^sha256_/, "");
    const signedHeaders = Object.keys(headerValues).sort();
    const canonicalHeaders = signedHeaders.map((key) => `${key}:${headerValues[key].trim()}\n`).join("");
    const canonicalRequest = [
      method,
      path,
      "",
      canonicalHeaders,
      signedHeaders.join(";"),
      payloadHash,
    ].join("\n");
    const scope = `${dateStamp}/auto/s3/aws4_request`;
    const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
    const signature = hmacHex(signingKey(config.secretAccessKey, dateStamp), stringToSign);
    const headers = new Headers(headerValues);
    headers.set(
      "Authorization",
      `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders.join(";")}, Signature=${signature}`,
    );
    return fetch(`https://${host}${path}`, {
      method,
      headers,
      body: options.body ? new Uint8Array(options.body) : undefined,
      signal: options.signal,
      cache: "no-store",
    });
  }
}

function awsDate(date: Date): string {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function encodeSegment(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeKey(value: string): string {
  return value.split("/").map(encodeSegment).join("/");
}

function canonicalSearch(params: URLSearchParams): string {
  return [...params.entries()]
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue))
    .map(([key, value]) => `${encodeSegment(key)}=${encodeSegment(value)}`)
    .join("&");
}

function sha256(value: crypto.BinaryLike): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key: crypto.BinaryLike, value: string): Buffer {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function hmacHex(key: crypto.BinaryLike, value: string): string {
  return crypto.createHmac("sha256", key).update(value).digest("hex");
}

function signingKey(secret: string, dateStamp: string): Buffer {
  const date = hmac(`AWS4${secret}`, dateStamp);
  const region = hmac(date, "auto");
  const service = hmac(region, "s3");
  return hmac(service, "aws4_request");
}
