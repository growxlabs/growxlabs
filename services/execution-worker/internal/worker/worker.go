package worker

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"math"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/execution/contract"
)

type Config struct {
	WorkerID           string
	WebBaseURL         string
	ToolServiceURL     string
	LegacyToolFallback bool
	ServiceSecret      string
	Environment        string
	LeaseDuration      time.Duration
	PollInterval       time.Duration
}

type Worker struct {
	pool   *pgxpool.Pool
	client *http.Client
	logger *slog.Logger
	config Config
}

type job struct {
	queueID        int64
	runID          string
	stepID         string
	organisationID string
	workspaceID    string
	userID         string
	requestID      string
	conversationID string
	agentID        string
	capabilityID   string
	skillID        string
	leaseToken     string
	attempt        int
	step           contract.Step
}

func New(pool *pgxpool.Pool, logger *slog.Logger, config Config) *Worker {
	return &Worker{
		pool: pool, logger: logger, config: config,
		client: &http.Client{Timeout: 5 * time.Minute},
	}
}

func (w *Worker) Run(ctx context.Context) error {
	ticker := time.NewTicker(w.config.PollInterval)
	defer ticker.Stop()
	for {
		worked, err := w.processOne(ctx)
		if err != nil && ctx.Err() == nil {
			w.logger.Error("worker iteration failed", "worker_id", w.config.WorkerID, "error", err)
		}
		if worked {
			continue
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}
	}
}

// ProcessBatch performs a bounded amount of durable work for request-driven
// runtimes such as Vercel Functions. It never polls or waits for more work.
func (w *Worker) ProcessBatch(ctx context.Context, limit int) (int, error) {
	if limit < 1 || limit > 10 {
		return 0, errors.New("worker batch limit must be between 1 and 10")
	}
	processed := 0
	for processed < limit {
		if err := ctx.Err(); err != nil {
			return processed, err
		}
		worked, err := w.processOne(ctx)
		if err != nil {
			return processed, err
		}
		if !worked {
			return processed, nil
		}
		processed++
	}
	return processed, nil
}

func (w *Worker) processOne(ctx context.Context) (bool, error) {
	item, ok, err := w.claim(ctx)
	if err != nil || !ok {
		return false, err
	}
	timeout := time.Duration(item.step.TimeoutMS) * time.Millisecond
	executionCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	output, executionErr := w.executeWithHeartbeat(executionCtx, cancel, item)
	if executionErr != nil {
		var typedFailure *executionFailure
		if errors.As(executionErr, &typedFailure) && typedFailure.code == "APPROVAL_REQUIRED" {
			return true, w.blockForApproval(ctx, item, executionErr)
		}
		return true, w.fail(ctx, item, executionErr, errors.Is(executionCtx.Err(), context.DeadlineExceeded))
	}
	return true, w.complete(ctx, item, output)
}

type executionResult struct {
	output json.RawMessage
	err    error
}

type executionFailure struct {
	code      string
	message   string
	retryable bool
}

func (e *executionFailure) Error() string { return e.message }

func (w *Worker) executeWithHeartbeat(
	ctx context.Context,
	cancel context.CancelFunc,
	item job,
) (json.RawMessage, error) {
	result := make(chan executionResult, 1)
	go func() {
		output, err := w.execute(ctx, item)
		result <- executionResult{output: output, err: err}
	}()
	heartbeatInterval := w.config.LeaseDuration / 3
	if heartbeatInterval < time.Second {
		heartbeatInterval = time.Second
	}
	ticker := time.NewTicker(heartbeatInterval)
	defer ticker.Stop()
	for {
		select {
		case completed := <-result:
			return completed.output, completed.err
		case <-ticker.C:
			if err := w.heartbeat(ctx, item); err != nil {
				cancel()
				completed := <-result
				if completed.err != nil {
					return nil, completed.err
				}
				return nil, fmt.Errorf("heartbeat failed: %w", err)
			}
		case <-ctx.Done():
			completed := <-result
			if completed.err != nil {
				return nil, completed.err
			}
			return nil, ctx.Err()
		}
	}
}

func (w *Worker) heartbeat(ctx context.Context, item job) error {
	tx, err := w.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	tag, err := tx.Exec(ctx, `
		UPDATE command_execution.steps
		SET lease_expires_at = now() + $4::interval, updated_at = now()
		WHERE id = $1::uuid AND lease_owner = $2 AND lease_token = $3::uuid
		  AND status = 'running'`,
		item.stepID, w.config.WorkerID, item.leaseToken,
		intervalLiteral(w.config.LeaseDuration),
	)
	if err != nil || tag.RowsAffected() != 1 {
		return fmt.Errorf("step lease is no longer owned: %w", err)
	}
	tag, err = tx.Exec(ctx, `
		UPDATE command_execution.queue
		SET claimed_until = now() + $3::interval
		WHERE id = $1 AND claim_token = $2::uuid`,
		item.queueID, item.leaseToken, intervalLiteral(w.config.LeaseDuration),
	)
	if err != nil || tag.RowsAffected() != 1 {
		return fmt.Errorf("queue lease is no longer owned: %w", err)
	}
	return tx.Commit(ctx)
}

func (w *Worker) claim(ctx context.Context) (job, bool, error) {
	tx, err := w.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.ReadCommitted})
	if err != nil {
		return job{}, false, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var item job
	var planBytes []byte
	err = tx.QueryRow(ctx, `
		SELECT q.id, q.run_id::text, q.step_id::text, q.organisation_id::text,
		       q.workspace_id::text, r.user_id::text, r.request_id,
		       r.conversation_id::text, r.agent_id, r.capability_id, r.skill_id,
		       r.plan
		FROM command_execution.queue q
		JOIN command_execution.runs r ON r.id = q.run_id
		WHERE q.available_at <= now()
		  AND (q.claimed_until IS NULL OR q.claimed_until < now())
		  AND r.status = 'running' AND r.cancellation_requested_at IS NULL
		ORDER BY q.available_at, q.id
		FOR UPDATE OF q SKIP LOCKED LIMIT 1`,
	).Scan(
		&item.queueID, &item.runID, &item.stepID, &item.organisationID,
		&item.workspaceID, &item.userID, &item.requestID, &item.conversationID,
		&item.agentID, &item.capabilityID, &item.skillID, &planBytes,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return job{}, false, nil
	}
	if err != nil {
		return job{}, false, err
	}
	var plan contract.Plan
	if err := json.Unmarshal(planBytes, &plan); err != nil {
		return job{}, false, err
	}
	found := false
	for _, step := range plan.Steps {
		if step.ID == item.stepID {
			item.step = step
			found = true
			break
		}
	}
	if !found {
		return job{}, false, fmt.Errorf("step %s missing from persisted plan", item.stepID)
	}
	err = tx.QueryRow(ctx, `
		UPDATE command_execution.queue
		SET claimed_by = $2, claim_token = gen_random_uuid(),
		    claimed_until = now() + $3::interval, delivery_count = delivery_count + 1
		WHERE id = $1
		RETURNING claim_token::text, delivery_count`,
		item.queueID, w.config.WorkerID, intervalLiteral(w.config.LeaseDuration),
	).Scan(&item.leaseToken, &item.attempt)
	if err != nil {
		return job{}, false, err
	}
	tag, err := tx.Exec(ctx, `
		UPDATE command_execution.steps
		SET status = 'running', lease_owner = $2, lease_token = $3::uuid,
		    lease_expires_at = now() + $4::interval,
		    started_at = COALESCE(started_at, now()), updated_at = now()
		WHERE id = $1::uuid AND status = 'queued'`,
		item.stepID, w.config.WorkerID, item.leaseToken, intervalLiteral(w.config.LeaseDuration),
	)
	if err != nil || tag.RowsAffected() != 1 {
		return job{}, false, fmt.Errorf("claim step: %w", err)
	}
	inputJSON := item.step.Input
	_, err = tx.Exec(ctx, `
		INSERT INTO command_execution.attempts (
			id, run_id, step_id, organisation_id, workspace_id, attempt_number,
			worker_id, lease_token, status, input
		) VALUES (
			gen_random_uuid(), $1::uuid, $2::uuid, $3, $4,
			$5, $6, $7::uuid, 'running', $8::jsonb
		)`,
		item.runID, item.stepID, item.organisationID, item.workspaceID,
		item.attempt, w.config.WorkerID, item.leaseToken, inputJSON,
	)
	if err != nil {
		return job{}, false, err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO command_execution.events
			(id, run_id, step_id, organisation_id, workspace_id, request_id, event_type, payload)
		VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, $5,
		        'step.started', jsonb_build_object('attempt', $6))`,
		item.runID, item.stepID, item.organisationID, item.workspaceID, item.requestID, item.attempt,
	)
	if err != nil {
		return job{}, false, err
	}
	if err := tx.Commit(ctx); err != nil {
		return job{}, false, err
	}
	return item, true, nil
}

func (w *Worker) execute(ctx context.Context, item job) (json.RawMessage, error) {
	switch item.step.Type {
	case "tool":
		output, err := w.callToolService(ctx, item)
		if err == nil || !w.config.LegacyToolFallback || !compatibilityFallbackAllowed(err) {
			return output, err
		}
		w.logger.Warn("tool service unavailable; using Phase 1 compatibility adapter",
			"request_id", item.requestID, "run_id", item.runID, "step_id", item.stepID)
		return w.callWebAdapter(ctx, item, "/api/private/v1/tool-executions")
	case "model":
		return w.callWebAdapter(ctx, item, "/api/private/v1/model-executions")
	case "transform":
		return executeTransform(item.step.Input)
	case "decision":
		return executeDecision(item.step.Input)
	case "wait":
		return executeWait(ctx, item.step.Input)
	default:
		return nil, fmt.Errorf("unsupported step type %q", item.step.Type)
	}
}

func compatibilityFallbackAllowed(err error) bool {
	var failure *executionFailure
	if errors.As(err, &failure) {
		return failure.code == "DOWNSTREAM_UNAVAILABLE" && failure.retryable
	}
	// Transport errors mean the Phase 4 service could not be reached. Policy,
	// permission, approval and validation failures are typed and never arrive here.
	return true
}

func (w *Worker) callToolService(ctx context.Context, item job) (json.RawMessage, error) {
	deadline, ok := ctx.Deadline()
	if !ok {
		return nil, errors.New("tool execution requires a bounded deadline")
	}
	attemptID := fmt.Sprintf("%s:%d", item.stepID, item.attempt)
	approvalID, err := w.approvedReference(ctx, item)
	if err != nil {
		return nil, err
	}
	payload, err := json.Marshal(map[string]any{
		"requestId": item.requestID, "traceId": item.requestID,
		"runId": item.runID, "stepId": item.stepID, "attemptId": attemptID,
		"attempt": item.attempt,
		"scope": map[string]any{
			"organisationId": item.organisationID, "workspaceId": item.workspaceID,
			"userId": item.userID, "permissions": item.step.RequiredPermissions,
		},
		"agentId": item.agentID, "capabilityId": item.capabilityID,
		"skillId": item.skillID, "toolId": item.step.ToolID,
		"toolVersion": "1.0.0", "input": json.RawMessage(item.step.Input),
		"idempotencyKey": fmt.Sprintf("%s:%s:%s:%d", item.organisationID, item.runID, item.stepID, item.attempt),
		"deadline":       deadline.UTC(),
		"approvalId":     approvalID,
	})
	if err != nil {
		return nil, err
	}
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer: "execution-worker", Audience: "tool-service", Service: "execution-worker",
		Env: w.config.Environment, RequestID: item.requestID,
		IssuedAt: now.Unix(), ExpiresAt: now.Add(2 * time.Minute).Unix(),
	}, w.config.ServiceSecret)
	if err != nil {
		return nil, err
	}
	request, err := http.NewRequestWithContext(
		ctx, http.MethodPost, w.config.ToolServiceURL,
		bytes.NewReader(payload),
	)
	if err != nil {
		return nil, err
	}
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-Request-ID", item.requestID)
	request.Header.Set("X-GXL-Internal-Path", "/internal/v1/tool-executions")
	response, err := w.client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	body, err := io.ReadAll(io.LimitReader(response.Body, 2<<20))
	if err != nil {
		return nil, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		var failurePayload struct {
			Status string `json:"status"`
			Error  *struct {
				Code      string `json:"code"`
				Message   string `json:"message"`
				Retryable bool   `json:"retryable"`
			} `json:"error"`
		}
		if json.Unmarshal(body, &failurePayload) == nil && failurePayload.Error != nil {
			return nil, &executionFailure{
				code: failurePayload.Error.Code, message: failurePayload.Error.Message,
				retryable: failurePayload.Error.Retryable,
			}
		}
		return nil, &executionFailure{
			code:      "DOWNSTREAM_UNAVAILABLE",
			message:   fmt.Sprintf("tool service returned status %d", response.StatusCode),
			retryable: response.StatusCode >= 500,
		}
	}
	if !json.Valid(body) {
		return nil, errors.New("tool service returned invalid JSON")
	}
	return body, nil
}

func (w *Worker) approvedReference(ctx context.Context, item job) (string, error) {
	var approvalID string
	err := w.pool.QueryRow(ctx, `
		SELECT id::text FROM command_governance.approval_requests
		WHERE organisation_id=$1 AND workspace_id=$2
		  AND run_id=$3::uuid AND step_id=$4::uuid
		  AND tool_id=$5 AND status='approved'
		  AND expires_at>now()
		  AND (authorisation_expires_at IS NULL OR authorisation_expires_at>now())
		ORDER BY resolved_at DESC LIMIT 1`,
		item.organisationID, item.workspaceID, item.runID, item.stepID, item.step.ToolID).Scan(&approvalID)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", nil
	}
	return approvalID, err
}

func (w *Worker) callWebAdapter(ctx context.Context, item job, path string) (json.RawMessage, error) {
	payload, err := json.Marshal(map[string]any{
		"runId": item.runID, "stepId": item.stepID, "attempt": item.attempt,
		"organisationId": item.organisationID, "workspaceId": item.workspaceID,
		"userId": item.userID, "requestId": item.requestID,
		"conversationId": item.conversationID, "agentId": item.agentID,
		"capabilityId": item.capabilityID, "skillId": item.skillID,
		"toolId": item.step.ToolID, "input": json.RawMessage(item.step.Input),
		"requiredPermissions": item.step.RequiredPermissions,
	})
	if err != nil {
		return nil, err
	}
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer: "execution-worker", Audience: "gxl-web", Service: "execution-worker",
		Env: w.config.Environment, RequestID: item.requestID,
		IssuedAt: now.Unix(), ExpiresAt: now.Add(2 * time.Minute).Unix(),
	}, w.config.ServiceSecret)
	if err != nil {
		return nil, err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, w.config.WebBaseURL+path, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-Request-ID", item.requestID)
	response, err := w.client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	body, err := io.ReadAll(io.LimitReader(response.Body, 2<<20))
	if err != nil {
		return nil, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("web adapter returned status %d", response.StatusCode)
	}
	if !json.Valid(body) {
		return nil, errors.New("web adapter returned invalid JSON")
	}
	return body, nil
}

func (w *Worker) complete(ctx context.Context, item job, output json.RawMessage) error {
	tx, err := w.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	tag, err := tx.Exec(ctx, `
		UPDATE command_execution.steps
		SET status = 'succeeded', output = $4::jsonb, finished_at = now(),
		    lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL, updated_at = now()
		WHERE id = $1::uuid AND status = 'running' AND lease_owner = $2
		  AND lease_token = $3::uuid`,
		item.stepID, w.config.WorkerID, item.leaseToken, output,
	)
	if err != nil || tag.RowsAffected() != 1 {
		return fmt.Errorf("stale completion rejected: %w", err)
	}
	if _, err = tx.Exec(ctx, `
		UPDATE command_execution.attempts
		SET status = 'succeeded', output = $3::jsonb, finished_at = now()
		WHERE step_id = $1::uuid AND lease_token = $2::uuid AND status = 'running'`,
		item.stepID, item.leaseToken, output); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `DELETE FROM command_execution.queue WHERE id = $1`, item.queueID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `
		INSERT INTO command_execution.events
			(id, run_id, step_id, organisation_id, workspace_id, request_id, event_type, payload)
		VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, $5,
		        'step.succeeded', jsonb_build_object('attempt', $6))`,
		item.runID, item.stepID, item.organisationID, item.workspaceID, item.requestID, item.attempt); err != nil {
		return err
	}
	var cancellationRequested bool
	if err = tx.QueryRow(ctx, `
		SELECT cancellation_requested_at IS NOT NULL
		FROM command_execution.runs WHERE id = $1::uuid FOR UPDATE`,
		item.runID).Scan(&cancellationRequested); err != nil {
		return err
	}
	if cancellationRequested {
		if _, err = tx.Exec(ctx, `
			UPDATE command_execution.steps
			SET status = 'cancelled', finished_at = now(), updated_at = now()
			WHERE run_id = $1::uuid AND status IN ('pending', 'queued', 'waiting')`,
			item.runID); err != nil {
			return err
		}
		if _, err = tx.Exec(ctx, `DELETE FROM command_execution.queue WHERE run_id = $1::uuid`, item.runID); err != nil {
			return err
		}
		if _, err = tx.Exec(ctx, `
			UPDATE command_execution.runs
			SET status = 'cancelled', finished_at = now(), updated_at = now()
			WHERE id = $1::uuid`, item.runID); err != nil {
			return err
		}
		if _, err = tx.Exec(ctx, `
			INSERT INTO command_execution.events
				(id, run_id, organisation_id, workspace_id, request_id, event_type, payload)
			VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, 'run.cancelled', '{}'::jsonb)`,
			item.runID, item.organisationID, item.workspaceID, item.requestID); err != nil {
			return err
		}
		return tx.Commit(ctx)
	}
	tag, err = tx.Exec(ctx, `
		UPDATE command_execution.runs r
		SET status = 'succeeded', finished_at = now(), updated_at = now()
		WHERE r.id = $1::uuid AND NOT EXISTS (
			SELECT 1 FROM command_execution.steps s
			WHERE s.run_id = r.id AND s.status NOT IN ('succeeded', 'skipped')
		)`, item.runID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 1 {
		if _, err = tx.Exec(ctx, `
			INSERT INTO command_execution.events
				(id, run_id, organisation_id, workspace_id, request_id, event_type, payload)
			VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, 'run.succeeded', '{}'::jsonb)`,
			item.runID, item.organisationID, item.workspaceID, item.requestID); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

func (w *Worker) fail(ctx context.Context, item job, executionErr error, timedOut bool) error {
	tx, err := w.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	errorCode := "STEP_EXECUTION_FAILED"
	attemptStatus := "failed"
	if timedOut {
		errorCode = "STEP_TIMEOUT"
		attemptStatus = "timed_out"
	}
	retryable := true
	var typedFailure *executionFailure
	if errors.As(executionErr, &typedFailure) {
		errorCode = typedFailure.code
		retryable = typedFailure.retryable
	}
	retry := retryable && item.attempt < item.step.RetryPolicy.MaxAttempts
	nextStatus := "failed"
	delay := time.Duration(0)
	if retry {
		nextStatus = "queued"
		delay = retryDelay(item.step.RetryPolicy, item.attempt)
	}
	tag, err := tx.Exec(ctx, `
		UPDATE command_execution.steps
		SET status = $4, last_error_code = $5, last_error_message = $6,
		    next_attempt_at = CASE WHEN $4 = 'queued' THEN now() + $7::interval ELSE NULL END,
		    finished_at = CASE WHEN $4 = 'failed' THEN now() ELSE NULL END,
		    lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL, updated_at = now()
		WHERE id = $1::uuid AND lease_owner = $2 AND lease_token = $3::uuid`,
		item.stepID, w.config.WorkerID, item.leaseToken, nextStatus,
		errorCode, executionErr.Error(), intervalLiteral(delay),
	)
	if err != nil || tag.RowsAffected() != 1 {
		return fmt.Errorf("stale failure rejected: %w", err)
	}
	if _, err = tx.Exec(ctx, `
		UPDATE command_execution.attempts
		SET status = $3, error_code = $4, error_message = $5, finished_at = now()
		WHERE step_id = $1::uuid AND lease_token = $2::uuid`,
		item.stepID, item.leaseToken, attemptStatus, errorCode, executionErr.Error()); err != nil {
		return err
	}
	eventType := "step.failed"
	if retry {
		eventType = "step.retry_scheduled"
		if _, err = tx.Exec(ctx, `
			UPDATE command_execution.queue
			SET claimed_by = NULL, claim_token = NULL, claimed_until = NULL,
			    available_at = now() + $2::interval
			WHERE id = $1`, item.queueID, intervalLiteral(delay)); err != nil {
			return err
		}
	} else {
		if _, err = tx.Exec(ctx, `DELETE FROM command_execution.queue WHERE id = $1`, item.queueID); err != nil {
			return err
		}
		if _, err = tx.Exec(ctx, `
			UPDATE command_execution.runs
			SET status = 'failed', error_code = $2, error_message = $3,
			    finished_at = now(), updated_at = now()
			WHERE id = $1::uuid`, item.runID, errorCode, executionErr.Error()); err != nil {
			return err
		}
	}
	if _, err = tx.Exec(ctx, `
		INSERT INTO command_execution.events
			(id, run_id, step_id, organisation_id, workspace_id, request_id, event_type, payload)
		VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, $5,
		        $6, jsonb_build_object('attempt', $7, 'errorCode', $8))`,
		item.runID, item.stepID, item.organisationID, item.workspaceID,
		item.requestID, eventType, item.attempt, errorCode); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (w *Worker) blockForApproval(ctx context.Context, item job, executionErr error) error {
	tx, err := w.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	tag, err := tx.Exec(ctx, `
		UPDATE command_execution.steps
		SET status='blocked',governance_status='blocked_for_approval',
		    last_error_code='APPROVAL_REQUIRED',last_error_message=$4,
		    lease_owner=NULL,lease_token=NULL,lease_expires_at=NULL,updated_at=now()
		WHERE id=$1::uuid AND lease_owner=$2 AND lease_token=$3::uuid`,
		item.stepID, w.config.WorkerID, item.leaseToken, executionErr.Error())
	if err != nil || tag.RowsAffected() != 1 {
		return fmt.Errorf("stale approval block rejected: %w", err)
	}
	if _, err = tx.Exec(ctx, `
		UPDATE command_execution.attempts
		SET status='failed',error_code='APPROVAL_REQUIRED',error_message=$3,finished_at=now()
		WHERE step_id=$1::uuid AND lease_token=$2::uuid`,
		item.stepID, item.leaseToken, executionErr.Error()); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `DELETE FROM command_execution.queue WHERE id=$1`, item.queueID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `
		UPDATE command_execution.runs SET status='waiting',updated_at=now()
		WHERE id=$1::uuid AND organisation_id=$2 AND workspace_id=$3`,
		item.runID, item.organisationID, item.workspaceID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `
		INSERT INTO command_execution.events
		    (id,run_id,step_id,organisation_id,workspace_id,request_id,event_type,payload)
		VALUES (gen_random_uuid(),$1::uuid,$2::uuid,$3,$4,$5,
		        'execution.blocked_for_approval','{}'::jsonb)`,
		item.runID, item.stepID, item.organisationID, item.workspaceID, item.requestID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func executeTransform(input json.RawMessage) (json.RawMessage, error) {
	var request struct {
		Operation string         `json:"operation"`
		Value     map[string]any `json:"value"`
		Keys      []string       `json:"keys"`
	}
	if err := json.Unmarshal(input, &request); err != nil {
		return nil, errors.New("invalid transform input")
	}
	if request.Operation != "pick" {
		return nil, errors.New("only the bounded pick transform is supported")
	}
	result := make(map[string]any, len(request.Keys))
	for _, key := range request.Keys {
		if value, ok := request.Value[key]; ok {
			result[key] = value
		}
	}
	return json.Marshal(map[string]any{"result": result})
}

func executeDecision(input json.RawMessage) (json.RawMessage, error) {
	var request struct {
		Operation string `json:"operation"`
		Left      any    `json:"left"`
		Right     any    `json:"right"`
	}
	if err := json.Unmarshal(input, &request); err != nil {
		return nil, errors.New("invalid decision input")
	}
	if request.Operation != "equals" {
		return nil, errors.New("only the bounded equals decision is supported")
	}
	left, _ := json.Marshal(request.Left)
	right, _ := json.Marshal(request.Right)
	return json.Marshal(map[string]bool{"result": bytes.Equal(left, right)})
}

func executeWait(ctx context.Context, input json.RawMessage) (json.RawMessage, error) {
	var request struct {
		DurationMS int `json:"durationMs"`
	}
	if err := json.Unmarshal(input, &request); err != nil || request.DurationMS < 0 || request.DurationMS > 60_000 {
		return nil, errors.New("wait duration must be between 0 and 60000 milliseconds")
	}
	timer := time.NewTimer(time.Duration(request.DurationMS) * time.Millisecond)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case <-timer.C:
		return json.RawMessage(`{"completed":true}`), nil
	}
}

func retryDelay(policy contract.RetryPolicy, attempt int) time.Duration {
	delay := float64(policy.InitialDelayMS) * math.Pow(2, float64(attempt-1))
	if delay > float64(policy.MaxDelayMS) {
		delay = float64(policy.MaxDelayMS)
	}
	return time.Duration(delay) * time.Millisecond
}

func intervalLiteral(duration time.Duration) string {
	return fmt.Sprintf("%d milliseconds", duration.Milliseconds())
}
