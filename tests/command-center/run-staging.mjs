process.env.STAGING_BASE_URL = "https://growxlabs-git-staging-go-verification-growxlabstechs-projects.vercel.app";
process.env.CRON_SECRET = "4a56caab12becbe578c7c2260e30cf66b7a8f334bffda493";
process.env.EXECUTION_SERVICE_JWT_SECRET = "5c43924ae192a92adb0cfdfdfc6ad31543f588bc7d5d4b03";
process.env.VERCEL_PROTECTION_BYPASS = "03d14afcc9fe4766a4960533371d80ff";
process.env.APP_ENV = "staging";

await import("./staging-e2e-verification.ts");
