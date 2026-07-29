package redaction

import "testing"

func TestSchemaAwareRedaction(t *testing.T) {
	output := Object(map[string]any{
		"name": "Ada", "email": "ada@example.com",
		"profile": map[string]any{"api_key": "secret", "safe": "value"},
	}, "confidential")
	if output["email"] != "[REDACTED]" || output["name"] != "Ada" {
		t.Fatalf("unexpected redaction: %#v", output)
	}
	nested := output["profile"].(map[string]any)
	if nested["api_key"] != "[REDACTED]" || nested["safe"] != "value" {
		t.Fatalf("unexpected nested redaction: %#v", nested)
	}
}
