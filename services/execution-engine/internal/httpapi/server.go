package httpapi

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"growx/commandcenter/execution-engine/internal/store"
	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/execution/contract"
)

type Server struct {
	store       *store.Postgres
	logger      *slog.Logger
	secret      string
	environment string
}

func New(database *store.Postgres, logger *slog.Logger, secret, environment string) http.Handler {
	server := &Server{store: database, logger: logger, secret: secret, environment: environment}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", server.health)
	mux.HandleFunc("GET /ready", server.ready)
	mux.Handle("POST /internal/v1/runs", server.authorize(http.HandlerFunc(server.createRun)))
	mux.Handle("GET /internal/v1/runs/{runID}", server.authorize(http.HandlerFunc(server.getRun)))
	mux.Handle("POST /internal/v1/runs/{runID}/cancel", server.authorize(http.HandlerFunc(server.cancelRun)))
	mux.Handle("GET /internal/v1/runs/{runID}/events", server.authorize(http.HandlerFunc(server.events)))
	return requestLog(logger, mux)
}

func (s *Server) authorize(next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
		if _, err := serviceauth.Verify(token, s.secret, "gxl-web", "execution-engine", s.environment, time.Now()); err != nil {
			writeError(response, http.StatusUnauthorized, "UNAUTHENTICATED", "valid internal service authentication is required")
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
		writeError(response, http.StatusServiceUnavailable, "NOT_READY", "database is unavailable")
		return
	}
	writeJSON(response, http.StatusOK, map[string]string{"status": "ready"})
}

func (s *Server) createRun(response http.ResponseWriter, request *http.Request) {
	var input contract.CreateRunRequest
	decoder := json.NewDecoder(http.MaxBytesReader(response, request.Body, 2<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		writeError(response, http.StatusBadRequest, "INVALID_REQUEST", "invalid create-run payload")
		return
	}
	if input.IdempotencyKey == "" || input.Plan.ID == "" || input.Plan.OrganisationID == "" || len(input.Plan.Steps) == 0 {
		writeError(response, http.StatusBadRequest, "INVALID_PLAN", "idempotency key and a scoped non-empty plan are required")
		return
	}
	if err := contract.ValidatePlan(input.Plan); err != nil {
		writeError(response, http.StatusBadRequest, "INVALID_PLAN", err.Error())
		return
	}
	run, created, err := s.store.CreateRun(request.Context(), input)
	if err != nil {
		s.logger.Error("create run failed", "request_id", input.Plan.RequestID, "error", err)
		writeError(response, http.StatusInternalServerError, "RUN_CREATE_FAILED", "run could not be persisted")
		return
	}
	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	writeJSON(response, status, run)
}

func (s *Server) getRun(response http.ResponseWriter, request *http.Request) {
	organisationID, workspaceID, ok := scopeHeaders(response, request)
	if !ok {
		return
	}
	run, err := s.store.GetRun(request.Context(), organisationID, workspaceID, request.PathValue("runID"))
	if errors.Is(err, store.ErrNotFound) {
		writeError(response, http.StatusNotFound, "RUN_NOT_FOUND", "run was not found")
		return
	}
	if err != nil {
		writeError(response, http.StatusInternalServerError, "RUN_READ_FAILED", "run could not be read")
		return
	}
	writeJSON(response, http.StatusOK, run)
}

func (s *Server) cancelRun(response http.ResponseWriter, request *http.Request) {
	organisationID, workspaceID, ok := scopeHeaders(response, request)
	if !ok {
		return
	}
	err := s.store.RequestCancellation(request.Context(), organisationID, workspaceID, request.PathValue("runID"))
	if errors.Is(err, store.ErrNotFound) {
		writeError(response, http.StatusNotFound, "RUN_NOT_CANCELLABLE", "run does not exist or is terminal")
		return
	}
	if err != nil {
		writeError(response, http.StatusInternalServerError, "RUN_CANCEL_FAILED", "cancellation could not be requested")
		return
	}
	response.WriteHeader(http.StatusAccepted)
}

func (s *Server) events(response http.ResponseWriter, request *http.Request) {
	organisationID, workspaceID, ok := scopeHeaders(response, request)
	if !ok {
		return
	}
	after, _ := strconv.ParseInt(request.URL.Query().Get("after"), 10, 64)
	events, err := s.store.ListEvents(request.Context(), organisationID, workspaceID, request.PathValue("runID"), after, 500)
	if err != nil {
		writeError(response, http.StatusInternalServerError, "EVENT_READ_FAILED", "events could not be read")
		return
	}
	writeJSON(response, http.StatusOK, map[string]any{"events": events})
}

func scopeHeaders(response http.ResponseWriter, request *http.Request) (string, string, bool) {
	organisationID := request.Header.Get("X-Organisation-ID")
	workspaceID := request.Header.Get("X-Workspace-ID")
	if organisationID == "" || workspaceID == "" {
		writeError(response, http.StatusBadRequest, "SCOPE_REQUIRED", "organisation and workspace headers are required")
		return "", "", false
	}
	return organisationID, workspaceID, true
}

func writeJSON(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(value)
}

func writeError(response http.ResponseWriter, status int, code, message string) {
	writeJSON(response, status, map[string]any{"error": map[string]string{"code": code, "message": message}})
}

func requestLog(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		started := time.Now()
		next.ServeHTTP(response, request)
		logger.Info("http request", "method", request.Method, "path", request.URL.Path, "duration_ms", time.Since(started).Milliseconds())
	})
}
