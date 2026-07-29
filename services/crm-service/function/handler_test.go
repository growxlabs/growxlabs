package function

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestUnauthenticatedInvocationDoesNotInitialiseDatabase(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgresql://must-not-be-used")
	t.Setenv("EXECUTION_SERVICE_JWT_SECRET", "test-secret-at-least-thirty-two-bytes")
	t.Setenv("APP_ENV", "test")
	request := httptest.NewRequest(http.MethodGet, "/api/private/crm/internal/v1/crm/leads", nil)
	response := httptest.NewRecorder()
	Handler(response, request)
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", response.Code)
	}
	if state.db != nil {
		t.Fatal("database was initialised before authentication")
	}
}
