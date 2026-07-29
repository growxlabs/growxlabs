package store

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"growx/commandcenter/phase4/contract"
	"growx/commandcenter/phase4/servicekit"
)

var ErrIdempotencyConflict = errors.New("idempotency key was reused with a different payload")

type Postgres struct{ Pool *pgxpool.Pool }

func Open(ctx context.Context, databaseURL string) (*Postgres, error) {
	pool, err := servicekit.OpenPostgresPool(ctx, databaseURL)
	if err != nil {
		return nil, err
	}
	return &Postgres{Pool: pool}, nil
}

func (p *Postgres) Close()                          { p.Pool.Close() }
func (p *Postgres) Ready(ctx context.Context) error { return p.Pool.Ping(ctx) }

func (p *Postgres) VerifyExecutionScope(ctx context.Context, request contract.ToolExecutionRequest) error {
	permissions, err := json.Marshal(request.Scope.Permissions)
	if err != nil {
		return err
	}
	var exists bool
	err = p.Pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM command_execution.runs r
			JOIN command_execution.steps s ON s.run_id = r.id
			WHERE r.id = $1::uuid AND s.id = $2::uuid
			  AND r.organisation_id = $3 AND r.workspace_id = $4
			  AND r.user_id = $5
			  AND r.agent_id = $6 AND r.capability_id = $7 AND r.skill_id = $8
			  AND s.required_permissions = $9::jsonb
			  AND r.status IN ('running', 'waiting')
			  AND s.status IN ('claimed', 'running')
		)`,
		request.RunID, request.StepID, request.Scope.OrganisationID,
		request.Scope.WorkspaceID, request.Scope.UserID, request.AgentID,
		request.CapabilityID, request.SkillID, permissions,
	).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("run, step, user or tenant scope does not match")
	}
	return nil
}

func (p *Postgres) BeginExecution(ctx context.Context, request contract.ToolExecutionRequest) (*contract.ToolExecutionResult, error) {
	hash := sha256.Sum256(request.Input)
	inputHash := hex.EncodeToString(hash[:])
	tx, err := p.Pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var storedHash, status string
	var resultJSON []byte
	err = tx.QueryRow(ctx, `
		SELECT input_hash, status, result
		FROM command_services.tool_execution_records
		WHERE organisation_id = $1 AND workspace_id = $2 AND idempotency_key = $3
		FOR UPDATE`,
		request.Scope.OrganisationID, request.Scope.WorkspaceID, request.IdempotencyKey,
	).Scan(&storedHash, &status, &resultJSON)
	if err == nil {
		if storedHash != inputHash {
			return nil, ErrIdempotencyConflict
		}
		if status == "succeeded" && len(resultJSON) > 0 {
			var result contract.ToolExecutionResult
			if err := json.Unmarshal(resultJSON, &result); err != nil {
				return nil, err
			}
			return &result, tx.Commit(ctx)
		}
		return nil, errors.New("identical tool execution is already in progress")
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO command_services.tool_execution_records (
			organisation_id, workspace_id, request_id, trace_id, run_id,
			step_id, attempt_id, tool_id, tool_version, idempotency_key,
			input_hash, status
		) VALUES ($1, $2, $3, $4, $5::uuid, $6::uuid, $7, $8, $9, $10, $11, 'started')`,
		request.Scope.OrganisationID, request.Scope.WorkspaceID, request.RequestID,
		request.TraceID, request.RunID, request.StepID, request.AttemptID,
		request.ToolID, request.ToolVersion, request.IdempotencyKey, inputHash,
	)
	if err != nil {
		return nil, err
	}
	return nil, tx.Commit(ctx)
}

func (p *Postgres) CompleteExecution(ctx context.Context, request contract.ToolExecutionRequest, result contract.ToolExecutionResult) error {
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return err
	}
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	tag, err := tx.Exec(ctx, `
		UPDATE command_services.tool_execution_records
		SET status = $4, result = $5::jsonb,
		    error_code = $6, completed_at = now()
		WHERE organisation_id = $1 AND workspace_id = $2
		  AND idempotency_key = $3 AND status = 'started'`,
		request.Scope.OrganisationID, request.Scope.WorkspaceID,
		request.IdempotencyKey, result.Status, resultJSON, errorCode(result.Error),
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return errors.New("stale tool completion rejected")
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO command_services.domain_events (
			event_type, organisation_id, workspace_id, request_id, trace_id,
			run_id, user_id, service_name, payload
		) VALUES ($1, $2, $3, $4, $5, $6::uuid, $7, 'tool-service',
		          jsonb_build_object('toolId', $8::text, 'toolVersion', $9::text,
		                             'status', $10::text))`,
		"tool_execution_"+result.Status, request.Scope.OrganisationID,
		request.Scope.WorkspaceID, request.RequestID, request.TraceID,
		request.RunID, request.Scope.UserID, request.ToolID, request.ToolVersion,
		result.Status,
	)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func errorCode(serviceError *contract.ServiceError) string {
	if serviceError == nil {
		return ""
	}
	return serviceError.Code
}
