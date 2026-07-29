package auth

import (
	"testing"
	"time"
)

func TestSignAndVerify(t *testing.T) {
	t.Parallel()
	now := time.Unix(1_800_000_000, 0)
	claims := Claims{
		Issuer: "gxl-web", Audience: "execution-engine", Service: "gxl-web",
		Env: "test", RequestID: "request-1", IssuedAt: now.Unix(),
		ExpiresAt: now.Add(time.Minute).Unix(),
	}
	token, err := Sign(claims, "test-secret")
	if err != nil {
		t.Fatal(err)
	}
	got, err := Verify(token, "test-secret", "gxl-web", "execution-engine", "test", now)
	if err != nil {
		t.Fatal(err)
	}
	if got.RequestID != claims.RequestID {
		t.Fatalf("request id = %q, want %q", got.RequestID, claims.RequestID)
	}
}

func TestVerifyRejectsWrongEnvironmentAndExpiredToken(t *testing.T) {
	t.Parallel()
	now := time.Unix(1_800_000_000, 0)
	claims := Claims{
		Issuer: "gxl-web", Audience: "execution-engine", Service: "gxl-web",
		Env: "production", RequestID: "request-1",
		IssuedAt: now.Add(-2 * time.Minute).Unix(), ExpiresAt: now.Add(-time.Minute).Unix(),
	}
	token, err := Sign(claims, "test-secret")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Verify(token, "test-secret", "gxl-web", "execution-engine", "production", now); err == nil {
		t.Fatal("expected expired token to be rejected")
	}
	if _, err := Verify(token, "test-secret", "gxl-web", "execution-engine", "preview", now.Add(-90*time.Second)); err == nil {
		t.Fatal("expected environment mismatch to be rejected")
	}
}
