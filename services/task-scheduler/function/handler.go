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

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/task-scheduler/internal/scheduler"
)

var state struct {
	sync.Mutex
	pool    *pgxpool.Pool
	service *scheduler.Scheduler
}

func Handler(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		write(response, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	if !authorised(request) {
		write(response, http.StatusUnauthorized, map[string]string{"error": "valid internal authentication is required"})
		return
	}
	service, err := initialise(request.Context())
	if err != nil {
		write(response, http.StatusServiceUnavailable, map[string]string{"error": "scheduler dependencies are unavailable"})
		return
	}
	invocation, cancel := context.WithTimeout(request.Context(), 20*time.Second)
	defer cancel()
	if err := service.ProcessBatch(invocation); err != nil {
		write(response, http.StatusInternalServerError, map[string]string{"error": "bounded scheduler invocation failed"})
		return
	}
	write(response, http.StatusOK, map[string]any{"bounded": true})
}

func initialise(ctx context.Context) (*scheduler.Scheduler, error) {
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
	state.service = scheduler.New(pool, slog.New(slog.NewJSONHandler(os.Stdout, nil)), schedulerBatchSize())
	return state.service, nil
}

func schedulerBatchSize() int {
	value, err := strconv.Atoi(os.Getenv("SCHEDULER_BATCH_SIZE"))
	if err != nil || value < 1 {
		return 25
	}
	if value > 100 {
		return 100
	}
	return value
}

func authorised(request *http.Request) bool {
	secret, environment := os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), os.Getenv("APP_ENV")
	token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
	for _, issuer := range []string{"gxl-web", "internal-api-gateway"} {
		claims, err := serviceauth.Verify(token, secret, issuer, "task-scheduler", environment, time.Now())
		if err == nil && claims.Service == issuer {
			return true
		}
	}
	return secret != "" && token == os.Getenv("CRON_SECRET")
}

func write(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(value)
}
