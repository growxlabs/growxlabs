package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/phase4/catalog"
	"growx/commandcenter/phase4/contract"
	"growx/commandcenter/phase4/policy"
	"growx/commandcenter/phase4/registry"
	"growx/commandcenter/tool-service/internal/adapter"
	"growx/commandcenter/tool-service/internal/store"
)

type Server struct {
	store       *store.Postgres
	registry    *registry.Registry[registry.Tool]
	adapter     *adapter.LegacyNextJS
	policy      *adapter.PolicyValidator
	governance  *adapter.GovernanceClient
	secret      string
	environment string
	logger      *slog.Logger
}

func New(database *store.Postgres, legacy *adapter.LegacyNextJS, policyValidator *adapter.PolicyValidator, governance *adapter.GovernanceClient, secret, environment string, logger *slog.Logger) (http.Handler, error) {
	tools, err := catalog.ToolRegistry()
	if err != nil {
		return nil, err
	}
	server := &Server{
		store: database, registry: tools, adapter: legacy, policy: policyValidator, governance: governance,
		secret: secret, environment: environment, logger: logger,
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", server.health)
	mux.HandleFunc("GET /ready", server.ready)
	mux.Handle("GET /internal/v1/tools/{toolID}", server.authorize(http.HandlerFunc(server.getTool)))
	mux.Handle("POST /internal/v1/tool-executions", server.authorize(http.HandlerFunc(server.execute)))
	return mux, nil
}

func (s *Server) authorize(next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
		authorised := false
		for _, issuer := range []string{"execution-worker", "internal-api-gateway"} {
			claims, err := serviceauth.Verify(token, s.secret, issuer, "tool-service", s.environment, time.Now())
			if err == nil && claims.Service == issuer {
				authorised = true
				break
			}
		}
		if !authorised {
			writeError(response, http.StatusUnauthorized, &contract.ServiceError{
				Code: "AUTHENTICATION_FAILED", Message: "valid worker service authentication is required",
				RequestID: request.Header.Get("X-Request-ID"), Retryable: false,
			})
			return
		}
		next.ServeHTTP(response, request)
	})
}

func (s *Server) health(response http.ResponseWriter, _ *http.Request) {
	writeJSON(response, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) ready(response http.ResponseWriter, request *http.Request) {
	if err := s.store.Ready(request.Context()); err != nil {
		writeError(response, http.StatusServiceUnavailable, &contract.ServiceError{
			Code: "DOWNSTREAM_UNAVAILABLE", Message: "database is unavailable", Retryable: true,
		})
		return
	}
	writeJSON(response, http.StatusOK, map[string]string{"status": "ready"})
}

func (s *Server) getTool(response http.ResponseWriter, request *http.Request) {
	definition, err := s.registry.Get(request.PathValue("toolID"), request.URL.Query().Get("version"), true)
	if err != nil {
		writeError(response, http.StatusNotFound, safeError("TOOL_UNAVAILABLE", "tool version is unavailable", request, false))
		return
	}
	writeJSON(response, http.StatusOK, definition.Contract())
}

func (s *Server) execute(response http.ResponseWriter, request *http.Request) {
	var input contract.ToolExecutionRequest
	decoder := json.NewDecoder(http.MaxBytesReader(response, request.Body, policy.MaxPayloadBytes))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		writeError(response, http.StatusBadRequest, safeError("INVALID_INPUT", "invalid tool execution request", request, false))
		return
	}
	definitionEntry, err := s.registry.Get(input.ToolID, input.ToolVersion, true)
	if err != nil {
		writeError(response, http.StatusNotFound, safeError("TOOL_UNAVAILABLE", "tool version is unavailable", request, false))
		return
	}
	definition := definitionEntry.Contract()
	if validationError := policy.ValidateExecution(input, definition, time.Now()); validationError != nil {
		if validationError.Code == "APPROVAL_REQUIRED" {
			if err := s.store.VerifyExecutionScope(request.Context(), input); err != nil {
				writeError(response, http.StatusForbidden, safeError("ORGANISATION_MISMATCH", "execution scope could not be verified", request, false))
				return
			}
			existing, err := s.store.BeginExecution(request.Context(), input)
			if err == nil && existing != nil {
				writeJSON(response, http.StatusConflict, existing)
				return
			}
			if err != nil {
				writeError(response, http.StatusConflict, safeError("CONFLICT", "approval block could not be recorded", request, false))
				return
			}
			blocked := contract.ToolExecutionResult{
				RequestID: input.RequestID, RunID: input.RunID, StepID: input.StepID,
				AttemptID: input.AttemptID, ToolID: input.ToolID, ToolVersion: input.ToolVersion,
				Status: "blocked", Error: validationError, IdempotencyKey: input.IdempotencyKey,
				CompletedAt: time.Now().UTC(),
			}
			if err := s.store.CompleteExecution(request.Context(), input, blocked); err != nil {
				writeError(response, http.StatusInternalServerError, safeError("INTERNAL_FAILURE", "approval block could not be persisted", request, true))
				return
			}
			writeJSON(response, http.StatusConflict, blocked)
			return
		}
		status := http.StatusForbidden
		if validationError.Code == "INVALID_INPUT" || validationError.Code == "TIMEOUT" {
			status = http.StatusBadRequest
		}
		writeError(response, status, validationError)
		return
	}
	if err := s.store.VerifyExecutionScope(request.Context(), input); err != nil {
		writeError(response, http.StatusForbidden, safeError("ORGANISATION_MISMATCH", "execution scope could not be verified", request, false))
		return
	}
	if validationError := s.policy.Validate(request.Context(), input); validationError != nil {
		status := http.StatusForbidden
		if validationError.Code == "DOWNSTREAM_UNAVAILABLE" || validationError.Code == "INTERNAL_FAILURE" {
			status = http.StatusServiceUnavailable
		}
		writeError(response, status, validationError)
		return
	}
	if validationError := s.governance.Authorise(request.Context(), input, definition); validationError != nil {
		if validationError.Code == "APPROVAL_REQUIRED" {
			s.blockForApproval(response, request, input, validationError)
			return
		}
		status := http.StatusForbidden
		if validationError.Code == "DOWNSTREAM_UNAVAILABLE" || validationError.Code == "INTERNAL_FAILURE" {
			status = http.StatusServiceUnavailable
		}
		writeError(response, status, validationError)
		return
	}
	existing, err := s.store.BeginExecution(request.Context(), input)
	if errors.Is(err, store.ErrIdempotencyConflict) {
		writeError(response, http.StatusConflict, safeError("IDEMPOTENCY_CONFLICT", err.Error(), request, false))
		return
	}
	if err != nil {
		writeError(response, http.StatusConflict, safeError("CONFLICT", "tool execution is already active", request, false))
		return
	}
	if existing != nil {
		writeJSON(response, http.StatusOK, existing)
		return
	}
	started := time.Now()
	executionContext, cancel := context.WithDeadline(request.Context(), input.Deadline)
	defer cancel()
	output, executionErr := s.adapter.Execute(executionContext, input)
	result := contract.ToolExecutionResult{
		RequestID: input.RequestID, RunID: input.RunID, StepID: input.StepID,
		AttemptID: input.AttemptID, ToolID: input.ToolID, ToolVersion: input.ToolVersion,
		Status: "succeeded", Output: output, ExecutionTimeMS: time.Since(started).Milliseconds(),
		IdempotencyKey: input.IdempotencyKey, CompletedAt: time.Now().UTC(),
	}
	if executionErr != nil {
		result.Status = "failed"
		result.Output = nil
		result.Error = &contract.ServiceError{
			Code: "DOWNSTREAM_UNAVAILABLE", Message: "tool adapter execution failed",
			RequestID: input.RequestID, Retryable: definition.Retryable,
		}
	}
	if result.Status == "succeeded" {
		if err := policy.ValidateJSONAgainstSchema(result.Output, definition.OutputSchema); err != nil {
			result.Status = "failed"
			result.Output = nil
			result.Error = &contract.ServiceError{
				Code: "INVALID_OUTPUT", Message: "tool output did not match its contract",
				RequestID: input.RequestID, Retryable: false,
			}
		}
	}
	if err := s.store.CompleteExecution(request.Context(), input, result); err != nil {
		s.logger.Error("persist tool completion", "request_id", input.RequestID, "tool_id", input.ToolID, "error", err)
		writeError(response, http.StatusInternalServerError, safeError("INTERNAL_FAILURE", "tool result could not be persisted", request, true))
		return
	}
	status := http.StatusOK
	if result.Status != "succeeded" {
		status = http.StatusBadGateway
	}
	writeJSON(response, status, result)
}

func (s *Server) blockForApproval(response http.ResponseWriter, request *http.Request, input contract.ToolExecutionRequest, validationError *contract.ServiceError) {
	existing, err := s.store.BeginExecution(request.Context(), input)
	if err == nil && existing != nil {
		writeJSON(response, http.StatusConflict, existing)
		return
	}
	if err != nil {
		writeError(response, http.StatusConflict, safeError("CONFLICT", "approval block could not be recorded", request, false))
		return
	}
	blocked := contract.ToolExecutionResult{
		RequestID: input.RequestID, RunID: input.RunID, StepID: input.StepID,
		AttemptID: input.AttemptID, ToolID: input.ToolID, ToolVersion: input.ToolVersion,
		Status: "blocked", Error: validationError, IdempotencyKey: input.IdempotencyKey,
		CompletedAt: time.Now().UTC(),
	}
	if err := s.store.CompleteExecution(request.Context(), input, blocked); err != nil {
		writeError(response, http.StatusInternalServerError, safeError("INTERNAL_FAILURE", "approval block could not be persisted", request, true))
		return
	}
	writeJSON(response, http.StatusConflict, blocked)
}

func safeError(code, message string, request *http.Request, retryable bool) *contract.ServiceError {
	return &contract.ServiceError{Code: code, Message: message, RequestID: request.Header.Get("X-Request-ID"), Retryable: retryable}
}

func writeError(response http.ResponseWriter, status int, serviceError *contract.ServiceError) {
	writeJSON(response, status, map[string]*contract.ServiceError{"error": serviceError})
}

func writeJSON(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(value)
}
