package main

import (
	"net/http/httptest"
	"testing"
)

func TestActorFromHeaders(t *testing.T) {
	request := httptest.NewRequest("GET", "/", nil)
	request.Header.Set("X-Actor-Id", "user-1")
	request.Header.Set("X-Organisation-Id", "org-1")
	request.Header.Set("X-Permissions", "candidate.view, candidate.move")
	request.RemoteAddr = "127.0.0.1:1234"
	ac, err := actorFrom(request)
	if err != nil {
		t.Fatal(err)
	}
	if !ac.Permissions["candidate.view"] || !ac.Permissions["candidate.move"] || ac.IP != "127.0.0.1" {
		t.Fatalf("unexpected actor: %#v", ac)
	}
}

func TestActorRequiresTenantContext(t *testing.T) {
	request := httptest.NewRequest("GET", "/", nil)
	if _, err := actorFrom(request); err == nil {
		t.Fatal("expected missing actor context to fail")
	}
}

func TestPositiveIntBounds(t *testing.T) {
	for input, expected := range map[string]int{"": 20, "0": 20, "10": 10, "101": 100} {
		if actual := positiveInt(input, 20); actual != expected {
			t.Fatalf("positiveInt(%q)=%d, want %d", input, actual, expected)
		}
	}
}
