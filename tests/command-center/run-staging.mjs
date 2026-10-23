import fs from "fs";
import path from "path";

// Attempt to load .env.test or .env.local if present locally (gitignored)
const envFiles = [".env.test", ".env.local"];
for (const envFile of envFiles) {
  const filePath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const equalsIdx = trimmed.indexOf("=");
      if (equalsIdx > 0) {
        const key = trimmed.slice(0, equalsIdx).trim();
        const val = trimmed.slice(equalsIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

if (!process.env.STAGING_BASE_URL) {
  process.env.STAGING_BASE_URL = "https://growxlabs-git-staging-go-verification-growxlabstechs-projects.vercel.app";
}
if (!process.env.APP_ENV) {
  process.env.APP_ENV = "staging";
}

await import("./staging-e2e-verification.ts");
