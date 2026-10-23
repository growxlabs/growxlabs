package function

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
)

func TestHandlerRequiresPrivateGatewayAuthentication(t *testing.T) {
	t.Setenv("EXECUTION_SERVICE_JWT_SECRET", "test-secret-at-least-thirty-two-bytes")
	t.Setenv("APP_ENV", "test")
	request := httptest.NewRequest(http.MethodPost, "/api/private/skills/internal/v1/skills/resolve", nil)
	response := httptest.NewRecorder()
	Handler(response, request)
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", response.Code)
	}
}

func TestHandlerAcceptsGxlWebGatewayAuthentication(t *testing.T) {
	secret := "test-secret-at-least-thirty-two-bytes"
	t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
	t.Setenv("APP_ENV", "test")
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer: "gxl-web", Audience: "internal-api-gateway",
		Service: "gxl-web", Env: "test", RequestID: "request-web",
		IssuedAt: now.Unix(), ExpiresAt: now.Add(time.Minute).Unix(),
	}, secret)
	if err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodPost, "/resolve", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	response := httptest.NewRecorder()
	Handler(response, request)
	if response.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400 (authenticated but empty body); body=%s", response.Code, response.Body)
	}
}
