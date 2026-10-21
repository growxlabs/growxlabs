package function

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
)

func TestSchedulerAuth(t *testing.T) {
	secret := "test-secret-at-least-thirty-two-bytes-long"
	env := "staging"

	t.Run("missing authorization header is rejected", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "valid-cron-secret")

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		if authorised(req) {
			t.Fatal("expected unauthenticated request to be rejected")
		}
	})

	t.Run("empty bearer token is rejected even if cron secret is unset", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "") // Empty or unset CRON_SECRET

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		req.Header.Set("Authorization", "Bearer ")
		if authorised(req) {
			t.Fatal("expected empty token with unset CRON_SECRET to be rejected (B8 regression)")
		}

		reqNoHeader := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		if authorised(reqNoHeader) {
			t.Fatal("expected no header with unset CRON_SECRET to be rejected (B8 regression)")
		}
	})

	t.Run("non-bearer token is rejected", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "valid-cron-secret")

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		req.Header.Set("Authorization", "Basic dXNlcjpwYXNz")
		if authorised(req) {
			t.Fatal("expected Basic auth to be rejected")
		}
	})

	t.Run("invalid cron secret is rejected", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "valid-cron-secret")

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		req.Header.Set("Authorization", "Bearer wrong-secret")
		if authorised(req) {
			t.Fatal("expected incorrect cron secret to be rejected")
		}
	})

	t.Run("valid cron secret is accepted", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "valid-cron-secret")

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		req.Header.Set("Authorization", "Bearer valid-cron-secret")
		if !authorised(req) {
			t.Fatal("expected valid cron secret to be accepted")
		}
	})

	t.Run("valid gxl-web service jwt is accepted", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "valid-cron-secret")

		now := time.Now()
		token, err := serviceauth.Sign(serviceauth.Claims{
			Issuer:   "gxl-web",
			Audience: "task-scheduler",
			Service:  "gxl-web",
			Env:      env,
			IssuedAt: now.Unix(),
			ExpiresAt: now.Add(2 * time.Minute).Unix(),
		}, secret)
		if err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		if !authorised(req) {
			t.Fatal("expected valid gxl-web service token to be accepted")
		}
	})

	t.Run("valid internal-api-gateway service jwt is accepted", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "")

		now := time.Now()
		token, err := serviceauth.Sign(serviceauth.Claims{
			Issuer:   "internal-api-gateway",
			Audience: "task-scheduler",
			Service:  "internal-api-gateway",
			Env:      env,
			IssuedAt: now.Unix(),
			ExpiresAt: now.Add(2 * time.Minute).Unix(),
		}, secret)
		if err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		if !authorised(req) {
			t.Fatal("expected valid internal-api-gateway service token to be accepted")
		}
	})

	t.Run("expired service jwt is rejected", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "valid-cron-secret")

		now := time.Now().Add(-10 * time.Minute)
		token, err := serviceauth.Sign(serviceauth.Claims{
			Issuer:   "gxl-web",
			Audience: "task-scheduler",
			Service:  "gxl-web",
			Env:      env,
			IssuedAt: now.Unix(),
			ExpiresAt: now.Add(1 * time.Minute).Unix(),
		}, secret)
		if err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		if authorised(req) {
			t.Fatal("expected expired service token to be rejected")
		}
	})

	t.Run("wrong audience service jwt is rejected", func(t *testing.T) {
		t.Setenv("EXECUTION_SERVICE_JWT_SECRET", secret)
		t.Setenv("APP_ENV", env)
		t.Setenv("CRON_SECRET", "valid-cron-secret")

		now := time.Now()
		token, err := serviceauth.Sign(serviceauth.Claims{
			Issuer:   "gxl-web",
			Audience: "execution-engine", // wrong audience!
			Service:  "gxl-web",
			Env:      env,
			IssuedAt: now.Unix(),
			ExpiresAt: now.Add(2 * time.Minute).Unix(),
		}, secret)
		if err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/private/scheduler", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		if authorised(req) {
			t.Fatal("expected wrong audience service token to be rejected")
		}
	})

	t.Run("handler rejects GET with 405", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/private/scheduler", nil)
		rec := httptest.NewRecorder()
		Handler(rec, req)
		if rec.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected 405 Method Not Allowed, got %d", rec.Code)
		}
	})
}
