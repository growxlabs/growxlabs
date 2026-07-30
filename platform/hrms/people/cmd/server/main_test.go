package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestActorFromRequiresTenantContext(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/employees", nil)
	if _, err := actorFrom(request); err == nil {
		t.Fatal("expected missing context error")
	}
}

func TestActorFromParsesPermissions(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/employees", nil)
	request.Header.Set("X-Actor-Id", "42fcb8dc-57cf-41ac-b78f-774c9d4080dc")
	request.Header.Set("X-Organisation-Id", "673d22ff-1060-41ee-8b79-9a3ae61c5ef7")
	request.Header.Set("X-Request-Id", "0ffbaec9-dc7d-45f0-b3ec-e30bf8e5d7b3")
	request.Header.Set("X-Permissions", "employee.view, manager.view_team")
	ac, err := actorFrom(request)
	if err != nil {
		t.Fatal(err)
	}
	if !ac.Permissions["employee.view"] || !ac.Permissions["manager.view_team"] {
		t.Fatal("permissions were not parsed")
	}
}

func TestPositiveIntBounds(t *testing.T) {
	if got := positiveInt("-1", 20, 1, 100); got != 20 {
		t.Fatalf("expected fallback, got %d", got)
	}
	if got := positiveInt("500", 20, 1, 100); got != 100 {
		t.Fatalf("expected cap, got %d", got)
	}
}
