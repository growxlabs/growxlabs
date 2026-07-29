package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/phase4/catalog"
	"growx/commandcenter/phase4/contract"
)

type resolutionRequest struct {
	SkillID      string         `json:"skillId"`
	Version      string         `json:"version"`
	AgentID      string         `json:"agentId"`
	CapabilityID string         `json:"capabilityId"`
	ToolIDs      []string       `json:"toolIds"`
	StepTypes    []string       `json:"stepTypes"`
	StepCount    int            `json:"stepCount"`
	Scope        contract.Scope `json:"scope"`
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	registry, err := catalog.SkillRegistry()
	if err != nil {
		logger.Error("skill registry failed", "error", err)
		os.Exit(1)
	}
	secret, environment := required("EXECUTION_SERVICE_JWT_SECRET", logger), required("APP_ENV", logger)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", status("ok"))
	mux.HandleFunc("GET /ready", status("ready"))
	mux.Handle("POST /internal/v1/skills/resolve", authorize(secret, environment, http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		var input resolutionRequest
		decoder := json.NewDecoder(http.MaxBytesReader(response, request.Body, 256<<10))
		decoder.DisallowUnknownFields()
		if decoder.Decode(&input) != nil {
			writeError(response, http.StatusBadRequest, "INVALID_INPUT", "invalid skill resolution request")
			return
		}
		entry, err := registry.Get(input.SkillID, input.Version, false)
		if err != nil {
			writeError(response, http.StatusNotFound, "SKILL_UNAVAILABLE", "skill is unavailable")
			return
		}
		definition := entry.Contract()
		if input.Scope.OrganisationID == "" || input.Scope.WorkspaceID == "" || input.Scope.UserID == "" ||
			!contains(definition.AllowedAgentIDs, input.AgentID) ||
			!contains(definition.CapabilityIDs, input.CapabilityID) ||
			input.StepCount < 1 || input.StepCount > definition.ExecutionPolicy.MaxSteps {
			writeError(response, http.StatusForbidden, "SKILL_FORBIDDEN", "skill constraints were not satisfied")
			return
		}
		for _, permission := range definition.RequiredPermissions {
			if !contains(input.Scope.Permissions, permission) {
				writeError(response, http.StatusForbidden, "USER_NOT_AUTHORISED", "required skill permission is unavailable")
				return
			}
		}
		for _, toolID := range input.ToolIDs {
			if !contains(definition.AllowedToolIDs, toolID) {
				writeError(response, http.StatusForbidden, "TOOL_FORBIDDEN", "plan contains a tool forbidden by the skill")
				return
			}
		}
		for _, stepType := range input.StepTypes {
			if !contains(definition.ExecutionPolicy.AllowedStepTypes, stepType) {
				writeError(response, http.StatusForbidden, "SKILL_FORBIDDEN", "plan contains a forbidden step type")
				return
			}
		}
		writeJSON(response, http.StatusOK, map[string]any{
			"allowed": true, "definition": definition,
			"reason": "skill inputs, scope, permissions and execution policy are authorised",
		})
	})))
	server := &http.Server{Addr: required("SKILL_SERVICE_ADDRESS", logger), Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	run(server, logger)
}

func authorize(secret, environment string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
		claims, err := serviceauth.Verify(token, secret, "internal-api-gateway", "skill-service", environment, time.Now())
		if err != nil || claims.Service != "internal-api-gateway" {
			writeError(response, http.StatusUnauthorized, "AUTHENTICATION_FAILED", "valid internal gateway identity is required")
			return
		}
		next.ServeHTTP(response, request)
	})
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
func status(value string) http.HandlerFunc {
	return func(response http.ResponseWriter, _ *http.Request) {
		writeJSON(response, http.StatusOK, map[string]string{"status": value})
	}
}
func writeError(response http.ResponseWriter, statusCode int, code, message string) {
	writeJSON(response, statusCode, map[string]any{"error": map[string]any{"code": code, "message": message, "retryable": false}})
}
func writeJSON(response http.ResponseWriter, statusCode int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(statusCode)
	_ = json.NewEncoder(response).Encode(value)
}
func required(name string, logger *slog.Logger) string {
	value := os.Getenv(name)
	if value == "" {
		logger.Error("required environment variable missing", "name", name)
		os.Exit(1)
	}
	return value
}
func run(server *http.Server, logger *slog.Logger) {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	go func() {
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("service stopped", "error", err)
			stop()
		}
	}()
	<-ctx.Done()
	shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdown)
}
