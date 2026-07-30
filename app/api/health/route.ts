import { requestIdFrom } from "@/lib/command-center/production/errors";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  return Response.json({
    status: "UP",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? process.env.npm_package_version ?? "development",
    environment: process.env.VERCEL_ENV ?? process.env.APP_ENV ?? "development",
  }, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-ID": requestId,
    },
  });
}
