package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGatewayRouteDispatchUnauthenticated(t *testing.T) {
	t.Setenv("EXECUTION_SERVICE_JWT_SECRET", "test-secret-at-least-thirty-two-bytes")
	t.Setenv("APP_ENV", "test")

	routes := []string{
		"/api/private/gateway/capabilities/resolve",
		"/api/private/gateway/crm/leads",
		"/api/private/gateway/execution/run",
		"/api/private/gateway/finance/invoices",
		"/api/private/gateway/hr/employees",
		"/api/private/gateway/marketing/campaigns",
		"/api/private/gateway/projects/list",
		"/api/private/gateway/scheduler/tick",
		"/api/private/gateway/skills/resolve",
		"/api/private/gateway/tools/execute",
		"/api/private/gateway/worker/batch",
		"/api/private/gateway/governance/evaluate",
	}

	for _, route := range routes {
		t.Run(route, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, route, nil)
			rec := httptest.NewRecorder()
			Handler(rec, req)

			// All internal services require authorization or DB initialization; unauthenticated calls return 401 or 503
			if rec.Code != http.StatusUnauthorized && rec.Code != http.StatusServiceUnavailable {
				t.Errorf("route %s: expected status 401 or 503, got %d", route, rec.Code)
			}
		})
	}
}

func TestGatewayFallbackRouteUnauthenticated(t *testing.T) {
	t.Setenv("EXECUTION_SERVICE_JWT_SECRET", "test-secret-at-least-thirty-two-bytes")
	t.Setenv("APP_ENV", "test")

	req := httptest.NewRequest(http.MethodGet, "/api/private/gateway/unknown", nil)
	rec := httptest.NewRecorder()
	Handler(rec, req)

	if rec.Code != http.StatusUnauthorized && rec.Code != http.StatusServiceUnavailable {
		t.Errorf("expected status 401 or 503 for unauthenticated gateway call, got %d", rec.Code)
	}
}
