package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"growx/commandcenter/execution-worker/internal/worker"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	pool, err := pgxpool.New(ctx, required("DATABASE_URL", logger))
	if err != nil {
		logger.Error("database startup failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()
	if err := pool.Ping(ctx); err != nil {
		logger.Error("database readiness failed", "error", err)
		os.Exit(1)
	}
	config := worker.Config{
		WorkerID: required("EXECUTION_WORKER_ID", logger), WebBaseURL: required("GXL_WEB_BASE_URL", logger),
		ToolServiceURL:     required("TOOL_SERVICE_INTERNAL_URL", logger),
		LegacyToolFallback: os.Getenv("PHASE1_TOOL_COMPATIBILITY_FALLBACK_ENABLED") == "true",
		ServiceSecret:      required("EXECUTION_SERVICE_JWT_SECRET", logger), Environment: required("APP_ENV", logger),
		LeaseDuration: time.Duration(integerEnv("WORKER_LEASE_SECONDS", 90)) * time.Second,
		PollInterval:  time.Duration(integerEnv("WORKER_POLL_MS", 500)) * time.Millisecond,
	}
	service := worker.New(pool, logger, config)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(response http.ResponseWriter, _ *http.Request) { writeStatus(response, http.StatusOK, "ok") })
	mux.HandleFunc("GET /ready", func(response http.ResponseWriter, request *http.Request) {
		if err := pool.Ping(request.Context()); err != nil {
			writeStatus(response, http.StatusServiceUnavailable, "not_ready")
			return
		}
		writeStatus(response, http.StatusOK, "ready")
	})
	server := &http.Server{Addr: envOr("EXECUTION_WORKER_ADDRESS", ":8093"), Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	go func() {
		if err := service.Run(ctx); err != nil && !errors.Is(err, context.Canceled) {
			logger.Error("worker stopped", "error", err)
			stop()
		}
	}()
	go func() {
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("worker health server stopped", "error", err)
			stop()
		}
	}()
	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdownCtx)
}

func required(name string, logger *slog.Logger) string {
	value := os.Getenv(name)
	if value == "" {
		logger.Error("required environment variable missing", "name", name)
		os.Exit(1)
	}
	return value
}

func envOr(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func integerEnv(name string, fallback int) int {
	value, err := strconv.Atoi(os.Getenv(name))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func writeStatus(response http.ResponseWriter, status int, value string) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(map[string]string{"status": value})
}
