package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestSecuredRejectsMissingContext(t *testing.T) {
	t.Setenv("HRMS_BFF_SHARED_SECRET", "shared-secret")
	handler := secured(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { t.Fatal("downstream must not be called") }))
	request := httptest.NewRequest(http.MethodGet, "/v1/people/employees", nil)
	request.Header.Set("X-HRMS-BFF-Token", "shared-secret")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", response.Code)
	}
}

func TestSecuredForwardsAuthenticatedContext(t *testing.T) {
	t.Setenv("HRMS_BFF_SHARED_SECRET", "shared-secret")
	called := false
	handler := secured(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { called = true; w.WriteHeader(http.StatusNoContent) }))
	request := httptest.NewRequest(http.MethodGet, "/v1/people/employees", nil)
	request.Header.Set("X-Actor-Id", "1d84fa85-b34a-45eb-bf56-fd3ce84a6f23")
	request.Header.Set("X-Organisation-Id", "7f320bee-54ec-4388-84db-2a1bbc4cc358")
	request.Header.Set("X-HRMS-BFF-Token", "shared-secret")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if !called || response.Code != http.StatusNoContent {
		t.Fatalf("expected downstream 204, got %d", response.Code)
	}
}
func TestSecuredRejectsSpoofedActorHeaders(t *testing.T) {
	t.Setenv("HRMS_BFF_SHARED_SECRET", "shared-secret")
	handler := secured(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { t.Fatal("spoofed request reached service") }))
	request := httptest.NewRequest(http.MethodGet, "/v1/people/employees", nil)
	request.Header.Set("X-Actor-Id", "actor")
	request.Header.Set("X-Organisation-Id", "org")
	request.Header.Set("X-Permissions", "organisation.manage")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", response.Code)
	}
}

func TestRequestContextCreatesRequestID(t *testing.T) {
	handler := requestContext(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Request-Id") == "" {
			t.Fatal("request id missing")
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if response.Header().Get("X-Request-Id") == "" {
		t.Fatal("response request id missing")
	}
}

func TestRateLimiterRejectsBurst(t *testing.T) {
	l := &limiter{hits: map[string][]time.Time{}, limit: 1, window: time.Minute}
	handler := l.wrap(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) }))
	first := httptest.NewRecorder()
	handler.ServeHTTP(first, httptest.NewRequest(http.MethodGet, "/", nil))
	second := httptest.NewRecorder()
	handler.ServeHTTP(second, httptest.NewRequest(http.MethodGet, "/", nil))
	if first.Code != http.StatusNoContent || second.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 204 then 429, got %d then %d", first.Code, second.Code)
	}
}
func TestRedisRateLimiter(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer token" {
			t.Fatal("missing Redis token")
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, `[{"result":2},{"result":1}]`)
	}))
	defer server.Close()
	l := &limiter{limit: 2, window: time.Minute, redisURL: server.URL, redisToken: "token", client: server.Client()}
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	allowed, err := l.allowRedis(request, "actor")
	if err != nil || !allowed {
		t.Fatalf("expected Redis allowance, allowed=%v err=%v", allowed, err)
	}
}
