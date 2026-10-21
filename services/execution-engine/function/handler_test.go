package function

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
)

func TestExecutionEngineHandlerRequiresAuthentication(t *testing.T) {
	t.Setenv("EXECUTION_SERVICE_JWT_SECRET", "test-secret-at-least-thirty-two-bytes")
	t.Setenv("APP_ENV", "test")

	request := httptest.NewRequest(http.MethodPost, "/internal/v1/runs", nil)
	response := httptest.NewRecorder()
	Handler(response, request)
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", response.Code)
	}
}

func TestExecutionEngineHandlerRejectsInvalidJWT(t *testing.T) {
	t.Setenv("EXECUTION_SERVICE_JWT_SECRET", "test-secret-at-least-thirty-two-bytes")
	t.Setenv("APP_ENV", "test")

	request := httptest.NewRequest(http.MethodPost, "/internal/v1/runs", nil)
	request.Header.Set("Authorization", "Bearer invalid-service-token")
	response := httptest.NewRecorder()
	Handler(response, request)
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", response.Code)
	}
}

func TestExecutionEngineHandlerReturns503WhenDatabaseUnconfigured(t *testing.T) {
	secret := "test-secret-at-least-thirty-two-bytes"
	t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
	t.Setenv("APP_ENV", "test")
	t.Setenv("DATABASE_URL", "") // Unconfigured DB

	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer: "gxl-web", Audience: "execution-engine",
		Service: "gxl-web", Env: "test", RequestID: "req-1",
		IssuedAt: now.Unix(), ExpiresAt: now.Add(time.Minute).Unix(),
	}, secret)
	if err != nil {
		t.Fatal(err)
	}

	request := httptest.NewRequest(http.MethodPost, "/internal/v1/runs", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	response := httptest.NewRecorder()
	Handler(response, request)
	if response.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want 503 when DATABASE_URL is empty; body=%s", response.Code, response.Body)
	}
}
