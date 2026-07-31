# HRMS production Gateway configuration

The application has two independent server-only gateway variables:

```text
HRMS_GATEWAY_URL
```

Points to the deployed HRMS Go Gateway. It is used for People, Identity,
Recruitment and other HRMS domains.

```text
INTERNAL_API_GATEWAY_URL
```

Points to the Command Center execution/governance Gateway. It is not the HRMS
Gateway and must not be substituted for `HRMS_GATEWAY_URL`.

## Required Vercel production values

```env
HRMS_GATEWAY_URL=https://<deployed-hrms-gateway-domain>
HRMS_BFF_SHARED_SECRET=<same-secret-configured-on-the-hrms-gateway>
```

`HRMS_GATEWAY_URL` must not be any of:

```text
https://growxlabs.tech
https://www.growxlabs.tech
https://careers.growxlabs.tech
```

The BFF rejects those hosts to prevent a loop into the Vercel application.
Do not use a `NEXT_PUBLIC_*` variable for either the Gateway URL or shared
secret.

The HRMS Gateway deployment requires:

```env
HRMS_BFF_SHARED_SECRET=<same-secret-as-vercel>
PEOPLE_SERVICE_URL=https://<people-service-domain>
IDENTITY_SERVICE_URL=https://<identity-service-domain>
RECRUITMENT_SERVICE_URL=https://<recruitment-service-domain>
```

The People, Identity and Recruitment services require a valid managed
PostgreSQL `DATABASE_URL`. The URL belongs on their container platform, not in
browser-visible variables.

## Expected route construction

```text
Browser:
/api/v1/hrms/people/employees?page=1&pageSize=20

Next.js BFF:
{HRMS_GATEWAY_URL}/v1/people/employees?page=1&pageSize=20

Gateway to People service:
{PEOPLE_SERVICE_URL}/employees?page=1&pageSize=20
```

Identity permission resolution follows:

```text
{HRMS_GATEWAY_URL}/v1/identity/users/{userId}/permissions
```

## Feature-scoped configuration

Next.js startup validates only core authentication configuration:

```env
NEXTAUTH_SECRET=<at-least-32-characters>
NEXTAUTH_URL=https://growxlabs.tech
```

Command Center, storage and cron configuration are validated independently
when their readiness checks or feature code run. Missing R2, execution or cron
configuration therefore does not crash unrelated HRMS pages.

Do not insert placeholder secrets. Add real values to the Vercel Production
environment and redeploy.
