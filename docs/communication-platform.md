# Centralized Communication Platform

Migration: `20260811_communication_platform.sql` (run after `20260810_client_success_lifecycle.sql`).

The reusable server service is in `lib/communications/service.ts`. It queues email, in-app, and future channels through one message/recipient/queue/event model. Business modules should enqueue a message instead of calling an email provider directly. Delivery webhooks can record `sent`, `delivered`, `opened`, `clicked`, `bounced`, `spam`, `failed`, or `unsubscribed` events.

Protected routes:

- Admin timeline and enqueue: `/api/admin/communications`
- Client notifications: `/api/client/notifications`

This foundation does not yet include a worker/provider adapter, template editor, calendar/ICS sender, or scheduled reminder runner. Those should consume the queue rather than bypass it.
