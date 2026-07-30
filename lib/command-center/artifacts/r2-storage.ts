import crypto from "crypto";

export class R2StorageService {
  static buildObjectKey(organisationId: string, workspaceId: string, artifactId: string, filename: string): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    return `prod/${organisationId}/${workspaceId}/${year}/${month}/${artifactId}/${filename}`;
  }

  static generateSignedDownloadUrl(objectKey: string, expiresInSeconds = 900): string {
    const token = crypto.randomBytes(16).toString("hex");
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return `/api/admin/command-center/artifacts/download?key=${encodeURIComponent(objectKey)}&token=${token}&expires=${expires}`;
  }
}
