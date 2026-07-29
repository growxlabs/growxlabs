package function

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"growx/commandcenter/execution-worker/internal/worker"
	serviceauth "growx/commandcenter/execution/auth"
)

var state struct {
	sync.Mutex
	pool    *pgxpool.Pool
	service *worker.Worker
}

func Handler(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		write(response, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	if !authorised(request, "execution-worker") {
		write(response, http.StatusUnauthorized, map[string]string{"error": "valid internal authentication is required"})
		return
	}
	service, err := initialise(request.Context())
	if err != nil {
		write(response, http.StatusServiceUnavailable, map[string]string{"error": "worker dependencies are unavailable"})
		return
	}
	limit := boundedLimit(request.URL.Query().Get("limit"))
	invocation, cancel := context.WithTimeout(request.Context(), 50*time.Second)
	defer cancel()
	processed, err := service.ProcessBatch(invocation, limit)
	if err != nil {
		write(response, http.StatusInternalServerError, map[string]any{"processed": processed, "error": "bounded worker invocation failed"})
		return
	}
	write(response, http.StatusOK, map[string]any{"processed": processed, "bounded": true})
}

func initialise(ctx context.Context) (*worker.Worker, error) {
	state.Lock()
	defer state.Unlock()
	if state.service != nil {
		if err := state.pool.Ping(ctx); err == nil {
			return state.service, nil
		}
		state.pool.Close()
		state.pool, state.service = nil, nil
	}
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, errors.New("DATABASE_URL is required")
	}
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	config.MaxConns, config.MinConns = 3, 0
	config.MaxConnLifetime, config.MaxConnIdleTime = 5*time.Minute, 30*time.Second
	startup, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	pool, err := pgxpool.NewWithConfig(startup, config)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(startup); err != nil {
		pool.Close()
		return nil, err
	}
	state.pool = pool
	state.service = worker.New(pool, slog.New(slog.NewJSONHandler(os.Stdout, nil)), worker.Config{
		WorkerID: "vercel-" + os.Getenv("VERCEL_REGION"), WebBaseURL: os.Getenv("GXL_WEB_BASE_URL"),
		ToolServiceURL:     os.Getenv("TOOL_SERVICE_INTERNAL_URL"),
		LegacyToolFallback: os.Getenv("PHASE1_TOOL_COMPATIBILITY_FALLBACK_ENABLED") == "true",
		ServiceSecret:      os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), Environment: os.Getenv("APP_ENV"),
		LeaseDuration: 45 * time.Second, PollInterval: time.Second,
	})
	return state.service, nil
}

func authorised(request *http.Request, audience string) bool {
	secret, environment := os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), os.Getenv("APP_ENV")
	token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
	for _, issuer := range []string{"gxl-web", "internal-api-gateway", "task-scheduler"} {
		claims, err := serviceauth.Verify(token, secret, issuer, audience, environment, time.Now())
		if err == nil && claims.Service == issuer {
			return true
		}
	}
	return false
}

func boundedLimit(raw string) int {
	value, err := strconv.Atoi(raw)
	if err != nil || value < 1 {
		return 1
	}
	if value > 10 {
		return 10
	}
	return value
}

func write(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(value)
}
