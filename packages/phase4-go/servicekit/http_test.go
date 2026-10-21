package servicekit

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
)

func TestAuthorisedRejectsEmptyOrMissingToken(t *testing.T) {
	cfg := Config{
		ServiceName: "crm-service",
		Secret:      "test-secret-at-least-thirty-two-bytes",
		Environment: "test",
	}
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	if Authorised(cfg, req) {
		t.Fatal("expected unauthenticated request to fail")
	}
}

func TestAuthorisedAcceptsInternalGatewayToken(t *testing.T) {
	cfg := Config{
		ServiceName: "crm-service",
		Secret:      "test-secret-at-least-thirty-two-bytes",
		Environment: "test",
	}
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer:    "internal-api-gateway",
		Audience:  "crm-service",
		Service:   "internal-api-gateway",
		Env:       "test",
		RequestID: "req-1",
		IssuedAt:  now.Unix(),
		ExpiresAt: now.Add(time.Minute).Unix(),
	}, cfg.Secret)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	if !Authorised(cfg, req) {
		t.Fatal("expected internal-api-gateway token to pass")
	}
}

func TestAuthorisedAcceptsGxlWebConsolidatedGatewayToken(t *testing.T) {
	cfg := Config{
		ServiceName: "crm-service",
		Secret:      "test-secret-at-least-thirty-two-bytes",
		Environment: "test",
	}
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer:    "gxl-web",
		Audience:  "internal-api-gateway",
		Service:   "gxl-web",
		Env:       "test",
		RequestID: "req-web",
		IssuedAt:  now.Unix(),
		ExpiresAt: now.Add(time.Minute).Unix(),
	}, cfg.Secret)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	if !Authorised(cfg, req) {
		t.Fatal("expected gxl-web consolidated gateway token to pass")
	}
}
