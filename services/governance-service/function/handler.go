package function

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/governance-service/internal/repository"
	"growx/commandcenter/governance/approvals"
	"growx/commandcenter/governance/contracts"
	"growx/commandcenter/governance/policy"
	"growx/commandcenter/governance/redaction"
)

var state struct {
	sync.Mutex
	database *repository.Postgres
}

type trustedContext struct {
	OrganisationID string
	WorkspaceID    string
	UserID         string
}

func Handler(response http.ResponseWriter, request *http.Request) {
	response.Header().Set("X-Request-ID", request.Header.Get("X-Request-ID"))
	if !authorised(request) {
		writeError(response, http.StatusUnauthorized, "AUTHENTICATION_FAILED", "valid internal service authentication is required", false)
		return
	}
	scope, ok := trustedScope(request)
	if !ok {
		writeError(response, http.StatusForbidden, "POLICY_DENIED", "authoritative tenant and user scope is required", false)
		return
	}
	database, err := initialise(request.Context())
	if err != nil {
		writeError(response, http.StatusServiceUnavailable, "DOWNSTREAM_UNAVAILABLE", "governance database is unavailable", true)
		return
	}
	path := request.Header.Get("X-GXL-Internal-Path")
	invocation, cancel := context.WithTimeout(request.Context(), 50*time.Second)
	defer cancel()
	request = request.WithContext(invocation)
	switch {
	case path == "/internal/v1/governance/policy/evaluate":
		evaluate(response, request, database, scope, false)
	case path == "/internal/v1/governance/policy/simulate":
		evaluate(response, request, database, scope, true)
	case path == "/internal/v1/governance/approvals/create":
		createApproval(response, request, database, scope)
	case path == "/internal/v1/governance/approvals/list":
		listApprovals(response, request, database, scope)
	case path == "/internal/v1/governance/approvals/get":
		getApproval(response, request, database, scope)
	case path == "/internal/v1/governance/approvals/decide":
		decide(response, request, database, scope)
	case path == "/internal/v1/governance/approvals/revoke":
		revoke(response, request, database, scope)
	case path == "/internal/v1/governance/approvals/validate":
		validateApproval(response, request, database, scope)
	case path == "/internal/v1/governance/audit/query":
		queryAudit(response, request, database, scope)
	case path == "/internal/v1/governance/audit/verify":
		verifyAudit(response, request, database, scope)
	case path == "/internal/v1/governance/cron/expire-approvals":
		expireApprovals(response, request, database)
	case path == "/internal/v1/governance/cron/process-audit-outbox":
		processOutbox(response, request, database)
	default:
		writeError(response, http.StatusNotFound, "ROUTE_NOT_FOUND", "governance route is unavailable", false)
	}
}

func evaluate(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext, simulation bool) {
	if request.Method != http.MethodPost {
		writeError(response, 405, "METHOD_NOT_ALLOWED", "POST is required", false)
		return
	}
	var input contracts.EvaluationContext
	if decode(response, request, &input) != nil {
		writeError(response, 400, "POLICY_EVALUATION_FAILED", "invalid policy context", false)
		return
	}
	identity, err := database.ResolveApprover(request.Context(), scope.OrganisationID, scope.WorkspaceID, scope.UserID)
	if err != nil || !identity.Active {
		writeError(response, 403, "POLICY_DENIED", "authoritative user context is unavailable", false)
		return
	}
	if simulation && !contains(identity.Permissions, "governance.policies.manage") {
		writeError(response, 403, "POLICY_DENIED", "policy simulation permission is required", false)
		return
	}
	input.OrganisationID, input.WorkspaceID, input.UserID = scope.OrganisationID, scope.WorkspaceID, scope.UserID
	input.RoleIDs, input.TeamIDs, input.PermissionIDs = identity.RoleIDs, identity.TeamIDs, identity.Permissions
	definitions, err := database.ActivePolicies(request.Context(), scope.OrganisationID, scope.WorkspaceID)
	if err != nil {
		writeError(response, 500, "POLICY_EVALUATION_FAILED", "active policies could not be loaded", true)
		return
	}
	now := time.Now().UTC()
	decision := policy.Evaluate(input, definitions, now)
	fingerprint, err := approvals.Fingerprint(input)
	if err != nil {
		writeError(response, 500, "POLICY_EVALUATION_FAILED", "policy context could not be fingerprinted", false)
		return
	}
	if !simulation {
		if err := database.SavePolicyDecision(request.Context(), input, decision, fingerprint); err != nil {
			writeError(response, 500, "POLICY_EVALUATION_FAILED", "policy decision could not be persisted", true)
			return
		}
	}
	writeJSON(response, 200, map[string]any{"decision": decision, "contextFingerprint": fingerprint, "simulation": simulation})
}

func createApproval(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext) {
	var input struct {
		Approval       contracts.ApprovalRequest `json:"approval"`
		IdempotencyKey string                    `json:"idempotencyKey"`
	}
	if request.Method != http.MethodPost || decode(response, request, &input) != nil || input.IdempotencyKey == "" {
		writeError(response, 400, "APPROVAL_FORBIDDEN", "valid idempotent approval input is required", false)
		return
	}
	input.Approval.OrganisationID, input.Approval.WorkspaceID = scope.OrganisationID, scope.WorkspaceID
	input.Approval.RequestedByUserID = scope.UserID
	if len(input.Approval.SafeSummary) > 2000 || input.Approval.Title == "" {
		writeError(response, 400, "APPROVAL_FORBIDDEN", "bounded safe approval summary is required", false)
		return
	}
	safe := redaction.Object(map[string]any{"summary": input.Approval.SafeSummary}, "confidential")
	input.Approval.SafeSummary, _ = safe["summary"].(string)
	created, wasCreated, err := database.CreateApproval(request.Context(), repository.CreateApprovalInput{Request: input.Approval, IdempotencyKey: input.IdempotencyKey})
	if err != nil {
		writeError(response, 409, "APPROVAL_REQUEST_CHANGED", "approval request does not match the policy decision", false)
		return
	}
	status := 200
	if wasCreated {
		status = 201
	}
	writeJSON(response, status, map[string]any{"approval": created, "idempotentReplay": !wasCreated})
}

func listApprovals(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext) {
	if request.Method != http.MethodGet {
		writeError(response, 405, "METHOD_NOT_ALLOWED", "GET is required", false)
		return
	}
	items, err := database.ListApprovals(request.Context(), scope.OrganisationID, scope.WorkspaceID, scope.UserID, request.URL.Query().Get("status"), bounded(request.URL.Query().Get("limit"), 100))
	if err != nil {
		writeError(response, 500, "APPROVAL_FORBIDDEN", "approval inbox could not be loaded", true)
		return
	}
	writeJSON(response, 200, map[string]any{"items": items})
}

func getApproval(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext) {
	approval, decisions, err := database.Approval(request.Context(), scope.OrganisationID, scope.WorkspaceID, request.URL.Query().Get("id"))
	if err != nil {
		writeError(response, 404, "APPROVAL_NOT_FOUND", "approval request was not found", false)
		return
	}
	if approval.RequestedByUserID != scope.UserID {
		identity, identityErr := database.ResolveApprover(request.Context(), scope.OrganisationID, scope.WorkspaceID, scope.UserID)
		if identityErr != nil || !contains(identity.Permissions, "governance.approvals.decide") {
			writeError(response, 403, "APPROVAL_FORBIDDEN", "approval detail access is forbidden", false)
			return
		}
	}
	writeJSON(response, 200, map[string]any{"approval": approval, "decisions": decisions})
}

func decide(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext) {
	var input struct {
		ApprovalID     string `json:"approvalId"`
		Decision       string `json:"decision"`
		Reason         string `json:"reason"`
		IdempotencyKey string `json:"idempotencyKey"`
	}
	if request.Method != http.MethodPost || decode(response, request, &input) != nil || input.ApprovalID == "" || input.IdempotencyKey == "" || len(input.Reason) > 1000 {
		writeError(response, 400, "APPROVAL_FORBIDDEN", "valid explicit approval decision is required", false)
		return
	}
	evidence, _ := json.Marshal(map[string]any{"authenticatedAt": time.Now().UTC(), "authenticationMethod": "server-session"})
	approval, err := database.Decide(request.Context(), scope.OrganisationID, scope.WorkspaceID, input.ApprovalID, scope.UserID, input.Decision, input.Reason, input.IdempotencyKey, evidence, time.Now().UTC())
	if err != nil {
		var serviceError *contracts.ServiceError
		if errors.As(err, &serviceError) {
			writeJSON(response, 409, map[string]any{"error": serviceError})
			return
		}
		writeError(response, 409, "APPROVAL_ALREADY_RESOLVED", "approval decision could not be applied", false)
		return
	}
	writeJSON(response, 200, map[string]any{"approval": approval, "continuationRequired": approval.Status == "approved"})
}

func revoke(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext) {
	var input struct {
		ApprovalID string `json:"approvalId"`
		ReasonCode string `json:"reasonCode"`
		SafeReason string `json:"safeReason"`
	}
	if request.Method != http.MethodPost || decode(response, request, &input) != nil || input.ApprovalID == "" || input.ReasonCode == "" || len(input.SafeReason) > 1000 {
		writeError(response, 400, "APPROVAL_FORBIDDEN", "valid revocation input is required", false)
		return
	}
	if err := database.Revoke(request.Context(), scope.OrganisationID, scope.WorkspaceID, input.ApprovalID, scope.UserID, input.ReasonCode, input.SafeReason); err != nil {
		writeError(response, 409, "APPROVAL_ALREADY_RESOLVED", "approval cannot be revoked", false)
		return
	}
	writeJSON(response, 200, map[string]bool{"revoked": true})
}

func validateApproval(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext) {
	var input struct {
		Reference          approvals.ApprovalReference `json:"reference"`
		CurrentFingerprint string                      `json:"currentFingerprint"`
	}
	if request.Method != http.MethodPost || decode(response, request, &input) != nil {
		writeError(response, 400, "APPROVAL_FORBIDDEN", "valid approval reference is required", false)
		return
	}
	approval, _, err := database.Approval(request.Context(), scope.OrganisationID, scope.WorkspaceID, input.Reference.ApprovalRequestID)
	if err != nil {
		writeError(response, 404, "APPROVAL_NOT_FOUND", "approval request was not found", false)
		return
	}
	if serviceError := approvals.ValidateReference(approval, input.Reference, input.CurrentFingerprint, time.Now()); serviceError != nil {
		writeJSON(response, 409, map[string]any{"error": serviceError})
		return
	}
	writeJSON(response, 200, map[string]bool{"valid": true})
}

func queryAudit(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext) {
	identity, err := database.ResolveApprover(request.Context(), scope.OrganisationID, scope.WorkspaceID, scope.UserID)
	if err != nil || !contains(identity.Permissions, "governance.audit.read") {
		writeError(response, 403, "AUDIT_QUERY_FORBIDDEN", "audit read permission is required", false)
		return
	}
	to := time.Now().UTC()
	from := to.Add(-24 * time.Hour)
	if value, err := time.Parse(time.RFC3339, request.URL.Query().Get("from")); err == nil {
		from = value
	}
	if value, err := time.Parse(time.RFC3339, request.URL.Query().Get("to")); err == nil {
		to = value
	}
	items, err := database.AuditEvents(request.Context(), scope.OrganisationID, scope.WorkspaceID, from, to, bounded(request.URL.Query().Get("limit"), 100))
	if err != nil {
		var serviceError *contracts.ServiceError
		if errors.As(err, &serviceError) {
			writeJSON(response, 400, map[string]any{"error": serviceError})
			return
		}
		writeError(response, 500, "AUDIT_QUERY_FORBIDDEN", "audit history could not be queried", true)
		return
	}
	writeJSON(response, 200, map[string]any{"items": items})
}

func verifyAudit(response http.ResponseWriter, request *http.Request, database *repository.Postgres, scope trustedContext) {
	identity, err := database.ResolveApprover(request.Context(), scope.OrganisationID, scope.WorkspaceID, scope.UserID)
	if err != nil || !contains(identity.Permissions, "governance.audit.read") {
		writeError(response, 403, "AUDIT_QUERY_FORBIDDEN", "audit verification permission is required", false)
		return
	}
	period := time.Now().UTC()
	if value, err := time.Parse("2006-01-02", request.URL.Query().Get("period")); err == nil {
		period = value
	}
	if err := database.VerifyAudit(request.Context(), scope.OrganisationID, period); err != nil {
		writeError(response, 409, "AUDIT_INTEGRITY_FAILED", "audit integrity verification failed", false)
		return
	}
	writeJSON(response, 200, map[string]bool{"valid": true})
}

func expireApprovals(response http.ResponseWriter, request *http.Request, database *repository.Postgres) {
	if request.Method != http.MethodPost || request.Header.Get("X-GXL-Cron-Authorised") != "true" {
		writeError(response, 403, "CRON_FORBIDDEN", "authenticated Cron invocation is required", false)
		return
	}
	count, err := database.ExpireApprovals(request.Context(), request.Header.Get("X-Request-ID"), bounded(request.URL.Query().Get("limit"), 100))
	if err != nil {
		writeError(response, 500, "APPROVAL_EXPIRY_FAILED", "approval expiry batch failed", true)
		return
	}
	writeJSON(response, 200, map[string]any{"expired": count, "bounded": true})
}
func processOutbox(response http.ResponseWriter, request *http.Request, database *repository.Postgres) {
	if request.Method != http.MethodPost || request.Header.Get("X-GXL-Cron-Authorised") != "true" {
		writeError(response, 403, "CRON_FORBIDDEN", "authenticated Cron invocation is required", false)
		return
	}
	processed, failed, err := database.ProcessOutbox(request.Context(), request.Header.Get("X-Request-ID"), bounded(request.URL.Query().Get("limit"), 100))
	if err != nil {
		writeError(response, 500, "AUDIT_OUTBOX_PROCESSING_FAILED", "audit outbox batch failed", true)
		return
	}
	writeJSON(response, 200, map[string]any{"processed": processed, "failed": failed, "bounded": true})
}

func initialise(ctx context.Context) (*repository.Postgres, error) {
	state.Lock()
	defer state.Unlock()
	if state.database != nil && state.database.Ready(ctx) == nil {
		return state.database, nil
	}
	startup, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	database, err := repository.Open(startup, os.Getenv("DATABASE_URL"))
	if err == nil {
		state.database = database
	}
	return database, err
}
func authorised(request *http.Request) bool {
	token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
	for _, issuer := range []string{"gxl-web", "tool-service", "execution-worker"} {
		claims, err := serviceauth.Verify(token, os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), issuer, "internal-api-gateway", os.Getenv("APP_ENV"), time.Now())
		if err == nil && claims.Service == issuer {
			return true
		}
	}
	return false
}
func trustedScope(request *http.Request) (trustedContext, bool) {
	value := trustedContext{
		OrganisationID: request.Header.Get("X-GXL-Organisation-ID"),
		WorkspaceID:    request.Header.Get("X-GXL-Workspace-ID"),
		UserID:         request.Header.Get("X-GXL-User-ID"),
	}
	return value, value.OrganisationID != "" && value.WorkspaceID != "" && value.UserID != ""
}
func decode(response http.ResponseWriter, request *http.Request, target any) error {
	decoder := json.NewDecoder(http.MaxBytesReader(response, request.Body, 1<<20))
	decoder.DisallowUnknownFields()
	return decoder.Decode(target)
}
func bounded(raw string, maximum int) int {
	value, err := strconv.Atoi(raw)
	if err != nil || value < 1 {
		return 25
	}
	if value > maximum {
		return maximum
	}
	return value
}
func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
func writeError(response http.ResponseWriter, status int, code, message string, retryable bool) {
	writeJSON(response, status, map[string]any{"error": contracts.ServiceError{Code: code, Message: message, RequestID: response.Header().Get("X-Request-ID"), Retryable: retryable}})
}
func writeJSON(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(value)
}
