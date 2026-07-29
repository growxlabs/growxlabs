package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
)

const maxPayload = 1 << 20

type target struct{ prefix, audience, baseURL string }
type limiter struct {
	mu      sync.Mutex
	windows map[string]window
}
type window struct {
	started time.Time
	count   int
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	secret, environment := required("EXECUTION_SERVICE_JWT_SECRET", logger), required("APP_ENV", logger)
	targets := []target{
		{"/internal/v1/tools", "tool-service", required("TOOL_SERVICE_INTERNAL_URL", logger)},
		{"/internal/v1/tool-executions", "tool-service", required("TOOL_SERVICE_INTERNAL_URL", logger)},
		{"/internal/v1/capabilities", "capability-service", required("CAPABILITY_SERVICE_INTERNAL_URL", logger)},
		{"/internal/v1/skills", "skill-service", required("SKILL_SERVICE_INTERNAL_URL", logger)},
		{"/internal/v1/crm", "crm-service", required("CRM_SERVICE_INTERNAL_URL", logger)},
		{"/internal/v1/finance", "finance-service", required("FINANCE_SERVICE_INTERNAL_URL", logger)},
		{"/internal/v1/hr", "hr-service", required("HR_SERVICE_INTERNAL_URL", logger)},
		{"/internal/v1/projects", "project-service", required("PROJECT_SERVICE_INTERNAL_URL", logger)},
		{"/internal/v1/marketing", "marketing-service", required("MARKETING_SERVICE_INTERNAL_URL", logger)},
	}
	rateLimiter := &limiter{windows: make(map[string]window)}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", jsonStatus("ok"))
	mux.HandleFunc("GET /ready", func(response http.ResponseWriter, request *http.Request) {
		client := &http.Client{Timeout: 2 * time.Second}
		for _, item := range targets {
			check, err := http.NewRequestWithContext(request.Context(), http.MethodGet, strings.TrimRight(item.baseURL, "/")+"/ready", nil)
			if err != nil {
				writeError(response, http.StatusServiceUnavailable, "NOT_READY", "invalid downstream configuration")
				return
			}
			result, err := client.Do(check)
			if err != nil || result.StatusCode != http.StatusOK {
				if result != nil {
					result.Body.Close()
				}
				writeError(response, http.StatusServiceUnavailable, "NOT_READY", item.audience+" is unavailable")
				return
			}
			result.Body.Close()
		}
		writeJSON(response, http.StatusOK, map[string]string{"status": "ready"})
	})
	mux.Handle("/", authenticate(secret, environment, rateLimiter, http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		var selected *target
		for index := range targets {
			if strings.HasPrefix(request.URL.Path, targets[index].prefix) {
				selected = &targets[index]
				break
			}
		}
		if selected == nil {
			writeError(response, http.StatusNotFound, "ROUTE_NOT_FOUND", "internal route is unavailable")
			return
		}
		body, err := io.ReadAll(http.MaxBytesReader(response, request.Body, maxPayload))
		if err != nil {
			writeError(response, http.StatusRequestEntityTooLarge, "INVALID_INPUT", "payload exceeds gateway policy")
			return
		}
		targetURL, err := url.Parse(strings.TrimRight(selected.baseURL, "/") + request.URL.RequestURI())
		if err != nil {
			writeError(response, http.StatusInternalServerError, "INTERNAL_FAILURE", "downstream route is invalid")
			return
		}
		proxyRequest, err := http.NewRequestWithContext(request.Context(), request.Method, targetURL.String(), bytes.NewReader(body))
		if err != nil {
			writeError(response, http.StatusInternalServerError, "INTERNAL_FAILURE", "downstream request could not be created")
			return
		}
		requestID := request.Header.Get("X-Request-ID")
		now := time.Now()
		token, err := serviceauth.Sign(serviceauth.Claims{
			Issuer: "internal-api-gateway", Audience: selected.audience,
			Service: "internal-api-gateway", Env: environment, RequestID: requestID,
			IssuedAt: now.Unix(), ExpiresAt: now.Add(time.Minute).Unix(),
		}, secret)
		if err != nil {
			writeError(response, http.StatusInternalServerError, "INTERNAL_FAILURE", "service authentication failed")
			return
		}
		proxyRequest.Header.Set("Authorization", "Bearer "+token)
		proxyRequest.Header.Set("Content-Type", "application/json")
		proxyRequest.Header.Set("X-Request-ID", requestID)
		proxyRequest.Header.Set("Traceparent", request.Header.Get("Traceparent"))
		result, err := (&http.Client{Timeout: 45 * time.Second}).Do(proxyRequest)
		if err != nil {
			writeError(response, http.StatusBadGateway, "DOWNSTREAM_UNAVAILABLE", "internal service is unavailable")
			return
		}
		defer result.Body.Close()
		response.Header().Set("Content-Type", "application/json")
		response.WriteHeader(result.StatusCode)
		_, _ = io.Copy(response, io.LimitReader(result.Body, 2<<20))
	})))
	server := &http.Server{Addr: required("INTERNAL_API_GATEWAY_ADDRESS", logger), Handler: mux, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 20 * time.Second, WriteTimeout: 50 * time.Second}
	run(server, logger)
}

func authenticate(secret, environment string, rateLimiter *limiter, next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
		allowed := false
		for _, identity := range []string{"gxl-web", "execution-worker", "tool-service"} {
			claims, err := serviceauth.Verify(token, secret, identity, "internal-api-gateway", environment, time.Now())
			if err == nil && claims.Service == identity {
				allowed = true
				break
			}
		}
		if !allowed {
			writeError(response, http.StatusUnauthorized, "AUTHENTICATION_FAILED", "valid internal service identity is required")
			return
		}
		key := request.Header.Get("X-Service-Name")
		if key == "" {
			key = "internal-caller"
		}
		if !rateLimiter.allow(key, time.Now()) {
			writeError(response, http.StatusTooManyRequests, "RATE_LIMITED", "internal request rate exceeded")
			return
		}
		next.ServeHTTP(response, request)
	})
}

func (l *limiter) allow(key string, now time.Time) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	value := l.windows[key]
	if value.started.IsZero() || now.Sub(value.started) >= time.Minute {
		l.windows[key] = window{started: now, count: 1}
		return true
	}
	if value.count >= 600 {
		return false
	}
	value.count++
	l.windows[key] = value
	return true
}

func jsonStatus(value string) http.HandlerFunc {
	return func(response http.ResponseWriter, _ *http.Request) {
		writeJSON(response, http.StatusOK, map[string]string{"status": value})
	}
}
func writeError(response http.ResponseWriter, status int, code, message string) {
	writeJSON(response, status, map[string]any{"error": map[string]any{"code": code, "message": message, "retryable": status >= 500}})
}
func writeJSON(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
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
			logger.Error("gateway stopped", "error", err)
			stop()
		}
	}()
	<-ctx.Done()
	shutdown, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdown)
}
