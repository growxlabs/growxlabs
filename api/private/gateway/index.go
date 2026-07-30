package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	capability "growx/commandcenter/capability-service/function"
	crm "growx/commandcenter/crm-service/function"
	execution "growx/commandcenter/execution-engine/function"
	worker "growx/commandcenter/execution-worker/function"
	finance "growx/commandcenter/finance-service/function"
	governance "growx/commandcenter/governance-service/function"
	hr "growx/commandcenter/hr-service/function"
	gateway "growx/commandcenter/internal-api-gateway/function"
	marketing "growx/commandcenter/marketing-service/function"
	project "growx/commandcenter/project-service/function"
	skill "growx/commandcenter/skill-service/function"
	scheduler "growx/commandcenter/task-scheduler/function"
	tool "growx/commandcenter/tool-service/function"
)

// Handler is the consolidated single deployable Go entrypoint for Vercel.
func Handler(w http.ResponseWriter, r *http.Request) {
	started := time.Now()
	requestID := safeIdentifier(r.Header.Get("X-Request-ID"))
	if requestID == "" {
		requestID = randomID()
	}
	traceID := safeIdentifier(r.Header.Get("X-Trace-ID"))
	if traceID == "" {
		traceID = requestID
	}
	r.Header.Set("X-Request-ID", requestID)
	r.Header.Set("X-Trace-ID", traceID)
	w.Header().Set("X-Request-ID", requestID)
	w.Header().Set("Cache-Control", "no-store")
	recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
	defer func() {
		if recovered := recover(); recovered != nil {
			if !recorder.wroteHeader {
				writeSafeError(recorder, http.StatusInternalServerError, "INTERNAL_ERROR", "The request could not be completed.", requestID, true)
			}
		}
		slog.New(slog.NewJSONHandler(os.Stdout, nil)).Info("private gateway request",
			"timestamp", time.Now().UTC().Format(time.RFC3339Nano),
			"environment", os.Getenv("APP_ENV"),
			"service", "consolidated-private-go-gateway",
			"route", r.URL.Path,
			"requestId", requestID,
			"traceId", traceID,
			"durationMs", time.Since(started).Milliseconds(),
			"outcome", outcome(recorder.status),
			"status", recorder.status,
		)
	}()

	path := r.URL.Path
	internalPath := r.Header.Get("X-GXL-Internal-Path")

	switch {
	case strings.HasPrefix(path, "/api/private/gateway/capabilities") || strings.HasPrefix(path, "/api/private/capabilities") || strings.HasPrefix(internalPath, "/internal/v1/capabilities"):
		capability.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/crm") || strings.HasPrefix(path, "/api/private/crm") || strings.HasPrefix(internalPath, "/internal/v1/crm"):
		crm.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/execution") || strings.HasPrefix(path, "/api/private/execution"):
		execution.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/finance") || strings.HasPrefix(path, "/api/private/finance") || strings.HasPrefix(internalPath, "/internal/v1/finance"):
		finance.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/hr") || strings.HasPrefix(path, "/api/private/hr") || strings.HasPrefix(internalPath, "/internal/v1/hr"):
		hr.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/marketing") || strings.HasPrefix(path, "/api/private/marketing") || strings.HasPrefix(internalPath, "/internal/v1/marketing"):
		marketing.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/projects") || strings.HasPrefix(path, "/api/private/projects") || strings.HasPrefix(internalPath, "/internal/v1/projects"):
		project.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/scheduler") || strings.HasPrefix(path, "/api/private/scheduler"):
		scheduler.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/skills") || strings.HasPrefix(path, "/api/private/skills") || strings.HasPrefix(internalPath, "/internal/v1/skills"):
		skill.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/tools") || strings.HasPrefix(path, "/api/private/tools") || strings.HasPrefix(internalPath, "/internal/v1/tools") || strings.HasPrefix(internalPath, "/internal/v1/tool-executions"):
		tool.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/worker") || strings.HasPrefix(path, "/api/private/worker"):
		worker.Handler(recorder, r)
	case strings.HasPrefix(path, "/api/private/gateway/governance") || strings.HasPrefix(path, "/api/private/governance") || strings.HasPrefix(internalPath, "/internal/v1/governance"):
		governance.Handler(recorder, r)
	default:
		gateway.Handler(recorder, r)
	}
}

type statusRecorder struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func (r *statusRecorder) WriteHeader(status int) {
	if r.wroteHeader {
		return
	}
	r.status, r.wroteHeader = status, true
	r.ResponseWriter.WriteHeader(status)
}

func (r *statusRecorder) Write(body []byte) (int, error) {
	if !r.wroteHeader {
		r.WriteHeader(http.StatusOK)
	}
	return r.ResponseWriter.Write(body)
}

func (r *statusRecorder) Flush() {
	if flusher, ok := r.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

func safeIdentifier(value string) string {
	if len(value) < 8 || len(value) > 128 {
		return ""
	}
	for _, character := range value {
		if !(character >= 'a' && character <= 'z') &&
			!(character >= 'A' && character <= 'Z') &&
			!(character >= '0' && character <= '9') &&
			!strings.ContainsRune("._:-", character) {
			return ""
		}
	}
	return value
}

func randomID() string {
	value := make([]byte, 16)
	if _, err := rand.Read(value); err != nil {
		return "request-unavailable"
	}
	return hex.EncodeToString(value)
}

func outcome(status int) string {
	if status >= 500 {
		return "failure"
	}
	if status >= 400 {
		return "rejected"
	}
	return "success"
}

func writeSafeError(w http.ResponseWriter, status int, code, message, requestID string, retryable bool) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": false,
		"error": map[string]any{
			"code": code, "message": message, "requestId": requestID, "retryable": retryable,
		},
	})
}
