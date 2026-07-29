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

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/tool-service/internal/adapter"
	"growx/commandcenter/tool-service/internal/httpapi"
	"growx/commandcenter/tool-service/internal/store"
)

var state struct {
	sync.Mutex
	handler http.Handler
}

func Handler(response http.ResponseWriter, request *http.Request) {
	token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
	authorised := false
	for _, issuer := range []string{"execution-worker", "internal-api-gateway"} {
		claims, err := serviceauth.Verify(token, os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), issuer, "tool-service", os.Getenv("APP_ENV"), time.Now())
		if err == nil && claims.Service == issuer {
			authorised = true
			break
		}
	}
	if !authorised {
		http.Error(response, `{"error":{"code":"AUTHENTICATION_FAILED","message":"valid internal service authentication is required","retryable":false}}`, http.StatusUnauthorized)
		return
	}
	handler, err := initialise(request.Context())
	if err != nil {
		http.Error(response, `{"error":{"code":"DOWNSTREAM_UNAVAILABLE","message":"tool dependencies are unavailable","retryable":true}}`, http.StatusServiceUnavailable)
		return
	}
	cloned := request.Clone(request.Context())
	cloned.URL.Path = internalPath(request, "/api/private/tools")
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
	gatewayURL, webURL := os.Getenv("INTERNAL_API_GATEWAY_URL"), os.Getenv("GXL_WEB_BASE_URL")
	if databaseURL == "" || secret == "" || environment == "" || gatewayURL == "" || webURL == "" {
		return nil, errors.New("required tool function configuration is missing")
	}
	startup, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	database, err := store.Open(startup, databaseURL)
	if err != nil {
		return nil, err
	}
	handler, err := httpapi.New(
		database, adapter.NewLegacyNextJS(webURL, secret, environment),
		adapter.NewPolicyValidator(gatewayURL, secret, environment),
		adapter.NewGovernanceClient(gatewayURL, secret, environment),
		secret, environment, slog.New(slog.NewJSONHandler(os.Stdout, nil)),
	)
	if err != nil {
		database.Close()
		return nil, err
	}
	state.handler = handler
	return state.handler, nil
}
