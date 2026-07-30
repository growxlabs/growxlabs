-- Phase 8: additive production hardening.
-- Apply after 0003 through 0006. This migration never rewrites an applied migration.

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '45s';

ALTER TABLE artifact_idempotency_records
  ADD COLUMN IF NOT EXISTS organisation_id varchar(128),
  ADD COLUMN IF NOT EXISTS workspace_id varchar(128),
  ADD COLUMN IF NOT EXISTS request_hash varchar(64);

UPDATE artifact_idempotency_records AS idempotency
SET organisation_id = artifact.organisation_id,
    workspace_id = artifact.workspace_id
FROM artifact_records AS artifact
WHERE artifact.id = idempotency.artifact_id
  AND (idempotency.organisation_id IS NULL OR idempotency.workspace_id IS NULL);

ALTER TABLE artifact_idempotency_records
  ALTER COLUMN organisation_id SET NOT NULL,
  ALTER COLUMN workspace_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS artifact_idempotency_tenant_key_uq
  ON artifact_idempotency_records (organisation_id, workspace_id, idempotency_key);

CREATE UNIQUE INDEX IF NOT EXISTS artifact_object_key_uq
  ON artifact_records (object_key);

CREATE INDEX IF NOT EXISTS memory_active_retrieval_idx
  ON memory_records (organisation_id, workspace_id, owner_type, owner_id, updated_at DESC, id DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS memory_expiry_idx
  ON memory_records (expires_at, organisation_id, workspace_id)
  WHERE status = 'active' AND expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS artifact_tenant_listing_idx
  ON artifact_records (organisation_id, workspace_id, created_at DESC, id DESC)
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS artifact_expiry_idx
  ON artifact_records (expires_at, organisation_id, workspace_id)
  WHERE status = 'available' AND expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS artifact_retention_cleanup_idx
  ON artifact_retention_status (scheduled_deletion_at, artifact_id)
  WHERE legal_hold = false AND scheduled_deletion_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS platform_event_tenant_sequence_idx
  ON platform_events (organisation_id, workspace_id, sequence, id);

CREATE INDEX IF NOT EXISTS platform_event_run_sequence_idx
  ON platform_events (organisation_id, workspace_id, run_id, sequence)
  WHERE run_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS event_outbox_pending_idx
  ON platform_event_outbox (created_at, id)
  WHERE status IN ('pending', 'failed');

CREATE UNIQUE INDEX IF NOT EXISTS event_delivery_attempt_uq
  ON event_delivery_attempts (event_id, target_handler, attempt_number);

CREATE INDEX IF NOT EXISTS event_replay_tenant_status_idx
  ON event_replay_requests (organisation_id, workspace_id, status, created_at, id);

CREATE INDEX IF NOT EXISTS notification_tenant_inbox_idx
  ON notification_records (organisation_id, workspace_id, recipient_user_id, status, created_at DESC, id DESC);

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS organisation_id varchar(128),
  ADD COLUMN IF NOT EXISTS workspace_id varchar(128);

CREATE UNIQUE INDEX IF NOT EXISTS notification_preferences_tenant_user_uq
  ON notification_preferences (organisation_id, workspace_id, user_id)
  WHERE organisation_id IS NOT NULL AND workspace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS notification_expiry_idx
  ON notification_records (expires_at, organisation_id, workspace_id)
  WHERE status IN ('unread', 'read') AND expires_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS notification_source_recipient_uq
  ON notification_records (organisation_id, workspace_id, recipient_user_id, notification_type, source_type, source_id);

CREATE INDEX IF NOT EXISTS approval_pending_expiry_idx
  ON command_governance.approval_requests (expires_at, organisation_id, workspace_id)
  WHERE status IN ('pending', 'partially_approved');

CREATE INDEX IF NOT EXISTS approval_tenant_inbox_idx
  ON command_governance.approval_requests (organisation_id, workspace_id, status, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS governance_audit_tenant_cursor_idx
  ON command_governance.audit_events (organisation_id, workspace_id, occurred_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS execution_run_tenant_cursor_idx
  ON command_execution.runs (organisation_id, workspace_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS execution_step_ready_idx
  ON command_execution.steps (status, next_attempt_at, run_id, ordinal)
  WHERE status IN ('pending', 'retry_wait');

CREATE TABLE IF NOT EXISTS public.command_center_submission_idempotency (
  organisation_id varchar(128) NOT NULL,
  workspace_id varchar(128) NOT NULL,
  user_id varchar(128) NOT NULL,
  idempotency_key varchar(128) NOT NULL,
  request_hash varchar(64) NOT NULL CHECK (length(request_hash) = 64),
  status varchar(32) NOT NULL CHECK (status IN ('processing', 'succeeded', 'failed')),
  lease_expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (organisation_id, workspace_id, user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS command_submission_stale_lease_idx
  ON public.command_center_submission_idempotency (lease_expires_at)
  WHERE status = 'processing';

ALTER TABLE command_governance.cron_locks
  ADD COLUMN IF NOT EXISTS checkpoint text,
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_outcome text,
  ADD COLUMN IF NOT EXISTS last_error_code text;

CREATE INDEX IF NOT EXISTS cron_lease_expiry_idx
  ON command_governance.cron_locks (expires_at);

CREATE OR REPLACE FUNCTION public.command_center_ingest_event(
  p_event jsonb,
  p_dedup_key varchar DEFAULT NULL
)
RETURNS SETOF platform_events
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_id varchar(128);
  v_event_id varchar(128) := p_event->>'id';
BEGIN
  IF p_dedup_key IS NOT NULL THEN
    SELECT event_id INTO v_existing_id
    FROM event_deduplication_keys
    WHERE dedup_key = p_dedup_key;
    IF v_existing_id IS NOT NULL THEN
      RETURN QUERY SELECT * FROM platform_events WHERE id = v_existing_id;
      RETURN;
    END IF;
  END IF;

  INSERT INTO platform_events (
    id, version, event_type, category, organisation_id, workspace_id,
    request_id, trace_id, conversation_id, run_id, step_id,
    actor_type, actor_id, occurred_at, safe_payload, classification
  ) VALUES (
    v_event_id,
    COALESCE(p_event->>'version', '1.0.0'),
    p_event->>'event_type',
    p_event->>'category',
    p_event->>'organisation_id',
    p_event->>'workspace_id',
    p_event->>'request_id',
    NULLIF(p_event->>'trace_id', ''),
    NULLIF(p_event->>'conversation_id', ''),
    NULLIF(p_event->>'run_id', ''),
    NULLIF(p_event->>'step_id', ''),
    p_event->>'actor_type',
    p_event->>'actor_id',
    COALESCE((p_event->>'occurred_at')::timestamptz, now()),
    COALESCE(p_event->'safe_payload', '{}'::jsonb),
    COALESCE(p_event->>'classification', 'internal')
  );

  IF p_dedup_key IS NOT NULL THEN
    INSERT INTO event_deduplication_keys (dedup_key, event_id)
    VALUES (p_dedup_key, v_event_id);
  END IF;

  INSERT INTO platform_event_outbox (id, event_id, status)
  VALUES ('out_' || gen_random_uuid()::text, v_event_id, 'pending');

  RETURN QUERY SELECT * FROM platform_events WHERE id = v_event_id;
EXCEPTION
  WHEN unique_violation THEN
    IF p_dedup_key IS NULL THEN RAISE; END IF;
    SELECT event_id INTO v_existing_id
    FROM event_deduplication_keys
    WHERE dedup_key = p_dedup_key;
    RETURN QUERY SELECT * FROM platform_events WHERE id = v_existing_id;
END;
$$;

REVOKE ALL ON FUNCTION public.command_center_ingest_event(jsonb, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.command_center_ingest_event(jsonb, varchar) TO service_role;

CREATE OR REPLACE FUNCTION public.command_center_reserve_submission(
  p_organisation_id varchar,
  p_workspace_id varchar,
  p_user_id varchar,
  p_idempotency_key varchar,
  p_request_hash varchar,
  p_lease_seconds integer DEFAULT 120
)
RETURNS TABLE(acquired boolean, hash_conflict boolean)
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing public.command_center_submission_idempotency%ROWTYPE;
BEGIN
  INSERT INTO public.command_center_submission_idempotency (
    organisation_id, workspace_id, user_id, idempotency_key,
    request_hash, status, lease_expires_at
  ) VALUES (
    p_organisation_id, p_workspace_id, p_user_id, p_idempotency_key,
    p_request_hash, 'processing', now() + make_interval(secs => LEAST(GREATEST(p_lease_seconds, 30), 300))
  )
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    RETURN QUERY SELECT true, false;
    RETURN;
  END IF;

  SELECT * INTO v_existing
  FROM public.command_center_submission_idempotency
  WHERE organisation_id = p_organisation_id
    AND workspace_id = p_workspace_id
    AND user_id = p_user_id
    AND idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF v_existing.request_hash <> p_request_hash THEN
    RETURN QUERY SELECT false, true;
    RETURN;
  END IF;

  IF v_existing.status = 'processing' AND v_existing.lease_expires_at < now() THEN
    UPDATE public.command_center_submission_idempotency
    SET lease_expires_at = now() + make_interval(secs => LEAST(GREATEST(p_lease_seconds, 30), 300)),
        completed_at = NULL
    WHERE organisation_id = p_organisation_id
      AND workspace_id = p_workspace_id
      AND user_id = p_user_id
      AND idempotency_key = p_idempotency_key;
    RETURN QUERY SELECT true, false;
    RETURN;
  END IF;

  RETURN QUERY SELECT false, false;
END;
$$;

REVOKE ALL ON FUNCTION public.command_center_reserve_submission(varchar, varchar, varchar, varchar, varchar, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.command_center_reserve_submission(varchar, varchar, varchar, varchar, varchar, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.command_center_expire_memory(p_limit integer DEFAULT 100)
RETURNS TABLE(processed integer, succeeded integer, failed integer, checkpoint text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT memory.id
    FROM memory_records AS memory
    LEFT JOIN memory_retention_status AS retention ON retention.memory_id = memory.id
    WHERE memory.status = 'active'
      AND memory.expires_at IS NOT NULL
      AND memory.expires_at <= now()
      AND COALESCE(retention.legal_hold, false) = false
    ORDER BY memory.expires_at, memory.id
    FOR UPDATE OF memory SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit, 1), 250)
  ), updated AS (
    UPDATE memory_records AS memory
    SET status = 'expired', updated_at = now()
    FROM candidates
    WHERE memory.id = candidates.id
    RETURNING memory.id
  )
  SELECT count(*)::integer, count(*)::integer, 0, max(id)::text FROM updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.command_center_compact_memory(p_limit integer DEFAULT 100)
RETURNS TABLE(processed integer, succeeded integer, failed integer, checkpoint text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT memory.id,
           row_number() OVER (
             PARTITION BY memory.organisation_id, memory.workspace_id,
                          memory.owner_type, memory.owner_id, memory.memory_type,
                          md5(memory.content)
             ORDER BY memory.updated_at DESC, memory.id DESC
           ) AS duplicate_rank
    FROM memory_records AS memory
    LEFT JOIN memory_retention_status AS retention ON retention.memory_id = memory.id
    WHERE memory.status = 'active'
      AND memory.updated_at < now() - interval '24 hours'
      AND COALESCE(retention.legal_hold, false) = false
  ), candidates AS (
    SELECT id FROM ranked
    WHERE duplicate_rank > 1
    ORDER BY id
    LIMIT LEAST(GREATEST(p_limit, 1), 250)
  ), updated AS (
    UPDATE memory_records AS memory
    SET status = 'superseded', updated_at = now()
    FROM candidates
    WHERE memory.id = candidates.id
    RETURNING memory.id
  )
  SELECT count(*)::integer, count(*)::integer, 0, max(id)::text FROM updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.command_center_process_event_outbox(p_limit integer DEFAULT 100)
RETURNS TABLE(processed integer, succeeded integer, failed integer, checkpoint text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_row record;
  v_count integer := 0;
  v_checkpoint text := NULL;
BEGIN
  FOR v_row IN
    SELECT outbox.id, outbox.event_id
    FROM platform_event_outbox AS outbox
    WHERE outbox.status IN ('pending', 'failed') AND outbox.attempts < 5
    ORDER BY outbox.created_at, outbox.id
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit, 1), 250)
  LOOP
    INSERT INTO event_processing_status (event_id, handler_name, status, processed_at)
    VALUES (v_row.event_id, 'durable_event_projection', 'success', now())
    ON CONFLICT (event_id) DO NOTHING;
    UPDATE platform_event_outbox
    SET status = 'processed', attempts = attempts + 1, processed_at = now()
    WHERE id = v_row.id;
    v_count := v_count + 1;
    v_checkpoint := v_row.id;
  END LOOP;
  RETURN QUERY SELECT v_count, v_count, 0, v_checkpoint;
END;
$$;

ALTER TABLE notification_processing_status
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_error_code varchar(64);

CREATE OR REPLACE FUNCTION public.command_center_process_notifications(p_limit integer DEFAULT 100)
RETURNS TABLE(processed integer, succeeded integer, failed integer, checkpoint text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_row record;
  v_count integer := 0;
  v_checkpoint text := NULL;
BEGIN
  UPDATE notification_records
  SET status = 'expired'
  WHERE status IN ('unread', 'read') AND expires_at IS NOT NULL AND expires_at <= now();

  FOR v_row IN
    SELECT processing.id, processing.notification_id
    FROM notification_processing_status AS processing
    JOIN notification_records AS notification ON notification.id = processing.notification_id
    WHERE processing.status IN ('pending', 'failed')
      AND processing.attempts < 5
      AND notification.status <> 'expired'
    ORDER BY processing.created_at, processing.id
    FOR UPDATE OF processing SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit, 1), 250)
  LOOP
    UPDATE notification_processing_status
    SET status = 'success', attempts = attempts + 1, updated_at = now(), last_error_code = NULL
    WHERE id = v_row.id;
    v_count := v_count + 1;
    v_checkpoint := v_row.id;
  END LOOP;
  RETURN QUERY SELECT v_count, v_count, 0, v_checkpoint;
END;
$$;

REVOKE ALL ON FUNCTION public.command_center_expire_memory(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.command_center_compact_memory(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.command_center_process_event_outbox(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.command_center_process_notifications(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.command_center_expire_memory(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.command_center_compact_memory(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.command_center_process_event_outbox(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.command_center_process_notifications(integer) TO service_role;

COMMIT;
