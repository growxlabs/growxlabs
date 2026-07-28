package main

import (
	"net/http/httptest"
	"testing"
)

func TestActorFromHeaders(t *testing.T) {
	request := httptest.NewRequest("GET", "/", nil)
	request.Header.Set("X-Actor-Id", "user-id")
	request.Header.Set("X-Organisation-Id", "organisation-id")
	request.Header.Set("X-Permissions", "offer.view, onboarding.hr_task")
	request.RemoteAddr = "127.0.0.1:1234"
	ac, err := actorFrom(request)
	if err != nil {
		t.Fatal(err)
	}
	if !ac.Permissions["offer.view"] || !ac.Permissions["onboarding.hr_task"] || ac.IP != "127.0.0.1" {
		t.Fatalf("unexpected actor: %#v", ac)
	}
}

func TestActorRequiresTenantContext(t *testing.T) {
	if _, err := actorFrom(httptest.NewRequest("GET", "/", nil)); err == nil {
		t.Fatal("expected missing actor and organisation to fail")
	}
}

func TestOfferTokensAreRandom(t *testing.T) {
	first, second := randomToken(), randomToken()
	if len(first) != 64 || len(second) != 64 || first == second {
		t.Fatalf("invalid generated tokens: %q %q", first, second)
	}
}
