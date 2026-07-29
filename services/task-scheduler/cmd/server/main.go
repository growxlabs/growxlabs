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

	"growx/commandcenter/task-scheduler/internal/scheduler"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	databaseURL := required("DATABASE_URL", logger)
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		logger.Error("database startup failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()
	if err := pool.Ping(ctx); err != nil {
		logger.Error("database readiness failed", "error", err)
		os.Exit(1)
	}
	batchSize := integerEnv("SCHEDULER_BATCH_SIZE", 50)
	interval := time.Duration(integerEnv("SCHEDULER_INTERVAL_MS", 1000)) * time.Millisecond
	service := scheduler.New(pool, logger, batchSize)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(response http.ResponseWriter, _ *http.Request) {
		writeStatus(response, http.StatusOK, "ok")
	})
	mux.HandleFunc("GET /ready", func(response http.ResponseWriter, request *http.Request) {
		if err := pool.Ping(request.Context()); err != nil {
			writeStatus(response, http.StatusServiceUnavailable, "not_ready")
			return
		}
		writeStatus(response, http.StatusOK, "ready")
	})
	server := &http.Server{
		Addr:              envOr("TASK_SCHEDULER_ADDRESS", ":8092"),
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}
	go func() {
		if err := service.Run(ctx, interval); err != nil && !errors.Is(err, context.Canceled) {
			logger.Error("scheduler stopped", "error", err)
			stop()
		}
	}()
	go func() {
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("health server stopped", "error", err)
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
