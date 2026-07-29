package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"growx/commandcenter/execution/contract"
)

var ErrNotFound = errors.New("execution run not found")

type Postgres struct {
	pool *pgxpool.Pool
}

func Open(ctx context.Context, databaseURL string) (*Postgres, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("parse database config: %w", err)
	}
	config.MaxConns, config.MinConns = 20, 2
	config.MaxConnLifetime = 30 * time.Minute
	if os.Getenv("VERCEL") != "" {
		config.MaxConns, config.MinConns = 3, 0
		config.MaxConnLifetime, config.MaxConnIdleTime = 5*time.Minute, 30*time.Second
	}
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("open database pool: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}
	return &Postgres{pool: pool}, nil
}

func (p *Postgres) Close() {
	p.pool.Close()
}

func (p *Postgres) Ready(ctx context.Context) error {
	return p.pool.Ping(ctx)
}

func (p *Postgres) CreateRun(ctx context.Context, request contract.CreateRunRequest) (contract.Run, bool, error) {
	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return contract.Run{}, false, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var existing contract.Run
	var planBytes []byte
	err = tx.QueryRow(ctx, `
		SELECT id::text, idempotency_key, plan, status, created_at, updated_at
		FROM command_execution.runs
		WHERE organisation_id = $1 AND workspace_id = $2
		  AND idempotency_key = $3
		FOR UPDATE`,
		request.Plan.OrganisationID, request.Plan.WorkspaceID, request.IdempotencyKey,
	).Scan(&existing.ID, &existing.IdempotencyKey, &planBytes, &existing.Status, &existing.CreatedAt, &existing.UpdatedAt)
	if err == nil {
		if err := json.Unmarshal(planBytes, &existing.Plan); err != nil {
			return contract.Run{}, false, err
		}
		return existing, false, tx.Commit(ctx)
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return contract.Run{}, false, err
	}

	runID := request.Plan.ID
	now := time.Now().UTC()
	planJSON, err := json.Marshal(request.Plan)
	if err != nil {
		return contract.Run{}, false, err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO command_execution.runs (
			id, idempotency_key, plan_version, organisation_id, workspace_id,
			user_id, conversation_id, request_id, agent_id, capability_id,
			skill_id, status, plan, created_at, updated_at
		) VALUES (
			$1::uuid, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, 'queued', $12::jsonb, $13, $13
		)`,
		runID, request.IdempotencyKey, request.Plan.Version,
		request.Plan.OrganisationID, request.Plan.WorkspaceID, request.Plan.UserID,
		request.Plan.ConversationID, request.Plan.RequestID, request.Plan.AgentID,
		request.Plan.CapabilityID, request.Plan.SkillID, planJSON, now,
	)
	if err != nil {
		return contract.Run{}, false, err
	}

	stepIDs := make(map[string]string, len(request.Plan.Steps))
	for _, step := range request.Plan.Steps {
		stepIDs[step.ID] = step.ID
		retryJSON, marshalErr := json.Marshal(step.RetryPolicy)
		if marshalErr != nil {
			return contract.Run{}, false, marshalErr
		}
		permissionsJSON, marshalErr := json.Marshal(step.RequiredPermissions)
		if marshalErr != nil {
			return contract.Run{}, false, marshalErr
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO command_execution.steps (
				id, run_id, organisation_id, workspace_id, step_key, ordinal,
				step_type, status, input, required_permissions, retry_policy,
				timeout_ms, created_at, updated_at
			) VALUES (
				$1::uuid, $2::uuid, $3, $4, $5, $6, $7, 'pending',
				$8::jsonb, $9::jsonb, $10::jsonb, $11, $12, $12
			)`,
			step.ID, runID, request.Plan.OrganisationID, request.Plan.WorkspaceID,
			step.ID, step.Index, step.Type, step.Input, permissionsJSON,
			retryJSON, step.TimeoutMS, now,
		)
		if err != nil {
			return contract.Run{}, false, err
		}
	}

	for _, step := range request.Plan.Steps {
		for _, dependency := range step.DependsOn {
			dependencyID, ok := stepIDs[dependency]
			if !ok {
				return contract.Run{}, false, fmt.Errorf("unknown dependency %q", dependency)
			}
			_, err = tx.Exec(ctx, `
				INSERT INTO command_execution.step_dependencies
					(run_id, step_id, depends_on_step_id)
				VALUES ($1::uuid, $2::uuid, $3::uuid)`,
				runID, step.ID, dependencyID,
			)
			if err != nil {
				return contract.Run{}, false, err
			}
		}
	}

	eventPayload, _ := json.Marshal(map[string]string{"status": string(contract.RunQueued)})
	_, err = tx.Exec(ctx, `
		INSERT INTO command_execution.events (
			id, run_id, organisation_id, workspace_id, request_id, event_type, payload
		) VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, 'run.created', $5::jsonb)`,
		runID, request.Plan.OrganisationID, request.Plan.WorkspaceID,
		request.Plan.RequestID, eventPayload,
	)
	if err != nil {
		return contract.Run{}, false, err
	}
	if err := tx.Commit(ctx); err != nil {
		return contract.Run{}, false, err
	}
	return contract.Run{
		ID:             runID,
		IdempotencyKey: request.IdempotencyKey,
		Plan:           request.Plan,
		Status:         contract.RunQueued,
		CreatedAt:      now,
		UpdatedAt:      now,
	}, true, nil
}

func (p *Postgres) GetRun(ctx context.Context, organisationID, workspaceID, runID string) (contract.Run, error) {
	var run contract.Run
	var planBytes []byte
	err := p.pool.QueryRow(ctx, `
		SELECT id::text, idempotency_key, plan, status, created_at, updated_at
		FROM command_execution.runs
		WHERE id = $1::uuid AND organisation_id = $2 AND workspace_id = $3`,
		runID, organisationID, workspaceID,
	).Scan(&run.ID, &run.IdempotencyKey, &planBytes, &run.Status, &run.CreatedAt, &run.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return contract.Run{}, ErrNotFound
	}
	if err != nil {
		return contract.Run{}, err
	}
	if err := json.Unmarshal(planBytes, &run.Plan); err != nil {
		return contract.Run{}, err
	}
	return run, nil
}

func (p *Postgres) RequestCancellation(ctx context.Context, organisationID, workspaceID, runID string) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var resultingStatus, requestID string
	err = tx.QueryRow(ctx, `
		UPDATE command_execution.runs
		SET status = CASE WHEN status IN ('queued', 'waiting') THEN 'cancelled' ELSE 'cancelling' END,
		    cancellation_requested_at = now(),
		    finished_at = CASE WHEN status IN ('queued', 'waiting') THEN now() ELSE finished_at END,
		    updated_at = now()
		WHERE id = $1::uuid AND organisation_id = $2 AND workspace_id = $3
		  AND status IN ('queued', 'running', 'waiting')
		RETURNING status, request_id`,
		runID, organisationID, workspaceID,
	).Scan(&resultingStatus, &requestID)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	if resultingStatus == "cancelled" {
		if _, err = tx.Exec(ctx, `
			UPDATE command_execution.steps
			SET status = 'cancelled', finished_at = now(), updated_at = now()
			WHERE run_id = $1::uuid AND status IN ('pending', 'queued', 'waiting')`,
			runID); err != nil {
			return err
		}
		if _, err = tx.Exec(ctx, `DELETE FROM command_execution.queue WHERE run_id = $1::uuid`, runID); err != nil {
			return err
		}
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO command_execution.events
			(id, run_id, organisation_id, workspace_id, request_id, event_type, payload)
		VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5,
		        jsonb_build_object('status', $6::text))`,
		runID, organisationID, workspaceID, requestID,
		map[bool]string{true: "run.cancelled", false: "run.cancellation_requested"}[resultingStatus == "cancelled"],
		resultingStatus,
	)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (p *Postgres) ListEvents(ctx context.Context, organisationID, workspaceID, runID string, after int64, limit int) ([]contract.Event, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id::text, sequence, run_id::text, COALESCE(step_id::text, ''),
		       organisation_id, workspace_id, request_id, event_type,
		       event_version, payload, occurred_at
		FROM command_execution.events
		WHERE run_id = $1::uuid AND organisation_id = $2
		  AND workspace_id = $3 AND sequence > $4
		ORDER BY sequence ASC LIMIT $5`,
		runID, organisationID, workspaceID, after, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	events := make([]contract.Event, 0)
	for rows.Next() {
		var event contract.Event
		if err := rows.Scan(
			&event.ID, &event.Sequence, &event.RunID, &event.StepID,
			&event.OrganisationID, &event.WorkspaceID, &event.RequestID,
			&event.Type, &event.Version, &event.Payload, &event.OccurredAt,
		); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, rows.Err()
}
