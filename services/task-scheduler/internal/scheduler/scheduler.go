package scheduler

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Scheduler struct {
	pool      *pgxpool.Pool
	logger    *slog.Logger
	batchSize int
}

func New(pool *pgxpool.Pool, logger *slog.Logger, batchSize int) *Scheduler {
	return &Scheduler{pool: pool, logger: logger, batchSize: batchSize}
}

func (s *Scheduler) Run(ctx context.Context, interval time.Duration) error {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		if err := s.Tick(ctx); err != nil && ctx.Err() == nil {
			s.logger.Error("scheduler tick failed", "error", err)
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}
	}
}

// ProcessBatch is the serverless production invocation boundary. Tick already
// enforces the configured batch size and commits recovery/queue changes
// atomically; this method makes the bounded process model explicit.
func (s *Scheduler) ProcessBatch(ctx context.Context) error {
	return s.Tick(ctx)
}

func (s *Scheduler) Tick(ctx context.Context) error {
	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.ReadCommitted})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// Expired work is made available again. The lease token changes on the next
	// claim, so a late worker cannot commit a stale completion.
	if _, err = tx.Exec(ctx, `
		UPDATE command_execution.steps
		SET status = 'queued', lease_owner = NULL, lease_token = NULL,
		    lease_expires_at = NULL, updated_at = now()
		WHERE status = 'running' AND lease_expires_at < now()`); err != nil {
		return fmt.Errorf("recover expired step leases: %w", err)
	}
	if _, err = tx.Exec(ctx, `
		UPDATE command_execution.queue q
		SET claimed_by = NULL, claim_token = NULL, claimed_until = NULL,
		    available_at = now()
		FROM command_execution.steps s
		WHERE q.step_id = s.id AND s.status = 'queued'
		  AND q.claimed_until < now()`); err != nil {
		return fmt.Errorf("recover expired queue claims: %w", err)
	}

	rows, err := tx.Query(ctx, `
		SELECT s.id::text, s.run_id::text, s.organisation_id, s.workspace_id, r.request_id
		FROM command_execution.steps s
		JOIN command_execution.runs r ON r.id = s.run_id
		WHERE s.status = 'pending'
		  AND r.status IN ('queued', 'running', 'waiting')
		  AND r.cancellation_requested_at IS NULL
		  AND NOT EXISTS (
		      SELECT 1
		      FROM command_execution.step_dependencies d
		      JOIN command_execution.steps dependency ON dependency.id = d.depends_on_step_id
		      WHERE d.step_id = s.id AND dependency.status <> 'succeeded'
		  )
		ORDER BY r.created_at, s.ordinal
		FOR UPDATE OF s SKIP LOCKED
		LIMIT $1`, s.batchSize)
	if err != nil {
		return err
	}
	type runnable struct{ stepID, runID, organisationID, workspaceID, requestID string }
	items := make([]runnable, 0, s.batchSize)
	for rows.Next() {
		var item runnable
		if err := rows.Scan(&item.stepID, &item.runID, &item.organisationID, &item.workspaceID, &item.requestID); err != nil {
			rows.Close()
			return err
		}
		items = append(items, item)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return err
	}

	for _, item := range items {
		if _, err := tx.Exec(ctx, `
			UPDATE command_execution.steps SET status = 'queued', updated_at = now()
			WHERE id = $1::uuid AND status = 'pending'`, item.stepID); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO command_execution.queue
				(run_id, step_id, organisation_id, workspace_id, available_at)
			VALUES ($1::uuid, $2::uuid, $3, $4, now())
			ON CONFLICT (step_id) DO UPDATE
			SET available_at = LEAST(command_execution.queue.available_at, now())`,
			item.runID, item.stepID, item.organisationID, item.workspaceID); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `
			UPDATE command_execution.runs
			SET status = 'running', started_at = COALESCE(started_at, now()), updated_at = now()
			WHERE id = $1::uuid AND status IN ('queued', 'waiting')`, item.runID); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO command_execution.events
				(id, run_id, step_id, organisation_id, workspace_id, request_id, event_type, payload)
			VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, $5,
			        'step.queued', jsonb_build_object('stepId', $2::text))`,
			item.runID, item.stepID, item.organisationID, item.workspaceID, item.requestID); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}
