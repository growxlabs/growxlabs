# GrowxLabs Cloudflare Cron Worker

## Purpose
This Cloudflare Worker serves as the authoritative external cron trigger for GrowxLabs Command Center. It wakes the Vercel-hosted recovery endpoint every minute to:
1. Advance scheduled task steps whose execution time has arrived.
2. Claim and execute queued worker tasks using durable PostgreSQL leases.
3. Automatically recover orphaned execution steps whose workers crashed or timed out.

Execution remains entirely on Vercel and Supabase PostgreSQL. Cloudflare is strictly used for external clock scheduling without running heavy computation or storing state.

## Architecture & Security
- **Strict Authentication**: Every request sends `Authorization: Bearer <CRON_SECRET>`. Unauthenticated or invalid requests are immediately rejected with HTTP 401.
- **No Direct Go Exposure**: The worker only talks to the public Next.js cron recovery endpoint (`/api/cron/command-center/recover-execution`), never to private Go ports or internal gateway routes.
- **Bounded Invocations**: An `AbortController` timeout of 25 seconds guarantees invocations terminate cleanly within edge worker CPU and wall-clock boundaries.
- **Concurrency & Lease Safety**: If a recovery invocation is already in progress, the Next.js Upstash Redis distributed lock returns HTTP 409 Conflict. The worker gracefully recognizes this as a valid non-error state (`checkpoint: "locked"`).
- **Structured JSON Logging**: Every trigger, retry, and completion emits structured JSON logs compatible with Cloudflare Logpush and Datadog.

## Deployment Instructions

### Prerequisites
- Node.js 20+
- Cloudflare account with Workers enabled
- Cloudflare API Token configured locally (`npx wrangler login` or `CLOUDFLARE_API_TOKEN`)

### Step 1: Install Dependencies
```bash
cd platform/cloudflare-cron
npm install
```

### Step 2: Run Tests
```bash
npm test
```

### Step 3: Configure Secrets
The `CRON_SECRET` must match the value configured in Vercel (`process.env.CRON_SECRET`).

For Staging:
```bash
npx wrangler secret put CRON_SECRET --env staging
# Paste the high-entropy staging CRON_SECRET when prompted
```

For Production:
```bash
npx wrangler secret put CRON_SECRET --env production
# Paste the high-entropy production CRON_SECRET when prompted
```

### Step 4: Deploy Worker
For Staging:
```bash
npm run deploy:staging
```

For Production:
```bash
npm run deploy:prod
```

### Step 5: Verification & Smoke Test
1. **Health Check**:
   ```bash
   curl -i https://growxlabs-recovery-cron.<your-account>.workers.dev/health
   # Expected: HTTP 200 {"status":"healthy","service":"growxlabs-recovery-cron",...}
   ```

2. **Authenticated Manual Trigger**:
   ```bash
   curl -i -X POST https://growxlabs-recovery-cron.<your-account>.workers.dev/trigger \
     -H "Authorization: Bearer <CRON_SECRET>"
   # Expected: HTTP 200 {"success":true,"job":"recover-execution",...}
   ```

3. **Verify Cron Execution**:
   In Cloudflare Dashboard -> Workers & Pages -> `growxlabs-recovery-cron` -> Logs -> Live Logs, verify that scheduled triggers run once per minute.
