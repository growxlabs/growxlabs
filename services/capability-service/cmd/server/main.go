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
	CapabilityID string         `json:"capabilityId"`
	Version      string         `json:"version"`
	AgentID      string         `json:"agentId"`
	SkillID      string         `json:"skillId,omitempty"`
	ToolID       string         `json:"toolId,omitempty"`
	Scope        contract.Scope `json:"scope"`
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	registry, err := catalog.CapabilityRegistry()
	if err != nil {
		logger.Error("capability registry failed", "error", err)
		os.Exit(1)
	}
	secret, environment := required("EXECUTION_SERVICE_JWT_SECRET", logger), required("APP_ENV", logger)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", status("ok"))
	mux.HandleFunc("GET /ready", status("ready"))
	mux.Handle("POST /internal/v1/capabilities/resolve", authorize(secret, environment, http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		var input resolutionRequest
		decoder := json.NewDecoder(http.MaxBytesReader(response, request.Body, 256<<10))
		decoder.DisallowUnknownFields()
		if decoder.Decode(&input) != nil {
			writeError(response, http.StatusBadRequest, "INVALID_INPUT", "invalid capability resolution request")
			return
		}
		entry, err := registry.Get(input.CapabilityID, input.Version, false)
		if err != nil {
			writeError(response, http.StatusNotFound, "CAPABILITY_UNAVAILABLE", "capability is unavailable")
			return
		}
		definition := entry.Contract()
		if !contains(definition.AllowedAgentIDs, input.AgentID) ||
			(input.SkillID != "" && !contains(definition.AllowedSkillIDs, input.SkillID)) ||
			(input.ToolID != "" && !contains(definition.AllowedToolIDs, input.ToolID)) ||
			!scopeAllowed(definition, input.Scope) {
			writeError(response, http.StatusForbidden, "CAPABILITY_FORBIDDEN", "capability constraints were not satisfied")
			return
		}
		for _, permission := range definition.RequiredPermissions {
			if !contains(input.Scope.Permissions, permission) {
				writeError(response, http.StatusForbidden, "USER_NOT_AUTHORISED", "required capability permission is unavailable")
				return
			}
		}
		writeJSON(response, http.StatusOK, map[string]any{
			"allowed": true, "definition": definition,
			"reason": "agent, skill, tool, scope and permissions are authorised",
		})
	})))
	server := &http.Server{Addr: required("CAPABILITY_SERVICE_ADDRESS", logger), Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	run(server, logger)
}

func authorize(secret, environment string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
		claims, err := serviceauth.Verify(token, secret, "internal-api-gateway", "capability-service", environment, time.Now())
		if err != nil || claims.Service != "internal-api-gateway" {
			writeError(response, http.StatusUnauthorized, "AUTHENTICATION_FAILED", "valid internal gateway identity is required")
			return
		}
		next.ServeHTTP(response, request)
	})
}

func scopeAllowed(definition contract.CapabilityDefinition, scope contract.Scope) bool {
	if scope.OrganisationID == "" || scope.WorkspaceID == "" || scope.UserID == "" {
		return false
	}
	return (len(definition.OrganisationScope) == 0 || contains(definition.OrganisationScope, scope.OrganisationID)) &&
		(len(definition.WorkspaceScope) == 0 || contains(definition.WorkspaceScope, scope.WorkspaceID))
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
