package function

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"growx/commandcenter/execution-engine/internal/httpapi"
	"growx/commandcenter/execution-engine/internal/store"
	serviceauth "growx/commandcenter/execution/auth"
)

var state struct {
	sync.Mutex
	handler http.Handler
}

// Handler is a cold-start-safe, request-bounded Vercel Function adapter.
func Handler(response http.ResponseWriter, request *http.Request) {
	token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
	if _, err := serviceauth.Verify(token, os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), "gxl-web", "execution-engine", os.Getenv("APP_ENV"), time.Now()); err != nil {
		http.Error(response, `{"error":{"code":"UNAUTHENTICATED","message":"valid internal service authentication is required","retryable":false}}`, http.StatusUnauthorized)
		return
	}
	handler, err := initialise(request.Context())
	if err != nil {
		http.Error(response, `{"error":{"code":"DOWNSTREAM_UNAVAILABLE","message":"database initialization failed","retryable":true}}`, http.StatusServiceUnavailable)
		return
	}
	cloned := request.Clone(request.Context())
	cloned.URL.Path = internalPath(request, "/api/private/execution")
	handler.ServeHTTP(response, cloned)
}

func internalPath(request *http.Request, prefix string) string {
	if path := request.Header.Get("X-GXL-Internal-Path"); path != "" {
		return path
	}
	path := request.URL.Path
	if len(path) >= len(prefix) && path[:len(prefix)] == prefix {
		path = path[len(prefix):]
	}
	if path == "" {
		return "/"
	}
	return path
}

func initialise(ctx context.Context) (http.Handler, error) {
	state.Lock()
	defer state.Unlock()
	if state.handler != nil {
		return state.handler, nil
	}
	databaseURL, secret, environment := os.Getenv("DATABASE_URL"), os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), os.Getenv("APP_ENV")
	if databaseURL == "" || secret == "" || environment == "" {
		return nil, errors.New("required execution function configuration is missing")
	}
	startup, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	database, err := store.Open(startup, databaseURL)
	if err != nil {
		return nil, err
	}
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	state.handler = httpapi.New(database, logger, secret, environment)
	return state.handler, nil
}
