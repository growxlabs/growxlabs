package servicekit

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
	"growx/commandcenter/phase4/contract"
)

type Config struct {
	ServiceName string
	Address     string
	Secret      string
	Environment string
}

func Authenticate(config Config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		if !Authorised(config, request) {
			WriteError(response, http.StatusUnauthorized, &contract.ServiceError{
				Code: "AUTHENTICATION_FAILED", Message: "valid internal gateway identity is required",
				RequestID: request.Header.Get("X-Request-ID"), Retryable: false,
			})
			return
		}
		next.ServeHTTP(response, request)
	})
}

func Authorised(config Config, request *http.Request) bool {
	token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
	claims, err := serviceauth.Verify(
		token, config.Secret, "internal-api-gateway",
		config.ServiceName, config.Environment, time.Now(),
	)
	return err == nil && claims.Service == "internal-api-gateway"
}

func RegisterHealth(mux *http.ServeMux, ready func(context.Context) error) {
	mux.HandleFunc("GET /health", func(response http.ResponseWriter, _ *http.Request) {
		WriteJSON(response, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /ready", func(response http.ResponseWriter, request *http.Request) {
		if err := ready(request.Context()); err != nil {
			WriteError(response, http.StatusServiceUnavailable, &contract.ServiceError{
				Code: "DOWNSTREAM_UNAVAILABLE", Message: "required database is unavailable",
				RequestID: request.Header.Get("X-Request-ID"), Retryable: true,
			})
			return
		}
		WriteJSON(response, http.StatusOK, map[string]string{"status": "ready"})
	})
}

func Run(config Config, handler http.Handler, logger *slog.Logger) {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	server := &http.Server{
		Addr: config.Address, Handler: handler, ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout: 20 * time.Second, WriteTimeout: 30 * time.Second,
		IdleTimeout: 60 * time.Second,
	}
	go func() {
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("service stopped", "service", config.ServiceName, "error", err)
			stop()
		}
	}()
	<-ctx.Done()
	shutdown, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdown)
}

func Decode(response http.ResponseWriter, request *http.Request, target any) error {
	decoder := json.NewDecoder(http.MaxBytesReader(response, request.Body, 1<<20))
	decoder.DisallowUnknownFields()
	return decoder.Decode(target)
}

func WriteError(response http.ResponseWriter, status int, serviceError *contract.ServiceError) {
	WriteJSON(response, status, map[string]*contract.ServiceError{"error": serviceError})
}

func WriteJSON(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(value)
}

func Required(name string, logger *slog.Logger) string {
	value := os.Getenv(name)
	if value == "" {
		logger.Error("required environment variable missing", "name", name)
		os.Exit(1)
	}
	return value
}

func Error(request *http.Request, code, message string, retryable bool) *contract.ServiceError {
	return &contract.ServiceError{
		Code: code, Message: message, RequestID: request.Header.Get("X-Request-ID"),
		Retryable: retryable,
	}
}
