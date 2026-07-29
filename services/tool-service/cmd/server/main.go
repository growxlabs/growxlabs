package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"growx/commandcenter/tool-service/internal/adapter"
	"growx/commandcenter/tool-service/internal/httpapi"
	"growx/commandcenter/tool-service/internal/store"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	database, err := store.Open(ctx, required("DATABASE_URL", logger))
	if err != nil {
		logger.Error("database startup failed", "error", err)
		os.Exit(1)
	}
	defer database.Close()
	secret := required("EXECUTION_SERVICE_JWT_SECRET", logger)
	environment := required("APP_ENV", logger)
	handler, err := httpapi.New(
		database,
		adapter.NewLegacyNextJS(required("GXL_WEB_BASE_URL", logger), secret, environment),
		adapter.NewPolicyValidator(required("INTERNAL_API_GATEWAY_URL", logger), secret, environment),
		adapter.NewGovernanceClient(required("INTERNAL_API_GATEWAY_URL", logger), secret, environment),
		secret, environment, logger,
	)
	if err != nil {
		logger.Error("tool registry startup failed", "error", err)
		os.Exit(1)
	}
	server := &http.Server{
		Addr: required("TOOL_SERVICE_ADDRESS", logger), Handler: handler,
		ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 20 * time.Second,
		WriteTimeout: 40 * time.Second, IdleTimeout: 60 * time.Second,
	}
	go func() {
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("tool service stopped", "error", err)
			stop()
		}
	}()
	<-ctx.Done()
	shutdownContext, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdownContext)
}

func required(name string, logger *slog.Logger) string {
	value := os.Getenv(name)
	if value == "" {
		logger.Error("required environment variable missing", "name", name)
		os.Exit(1)
	}
	return value
}
