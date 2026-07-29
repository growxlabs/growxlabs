package worker

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"growx/commandcenter/execution/contract"
)

func TestTransformIsBounded(t *testing.T) {
	t.Parallel()
	output, err := executeTransform(json.RawMessage(`{
		"operation":"pick",
		"value":{"safe":1,"secret":2},
		"keys":["safe"]
	}`))
	if err != nil {
		t.Fatal(err)
	}
	if string(output) != `{"result":{"safe":1}}` {
		t.Fatalf("unexpected output: %s", output)
	}
	if _, err := executeTransform(json.RawMessage(`{"operation":"eval","value":{},"keys":[]}`)); err == nil {
		t.Fatal("expected arbitrary transform operation to be rejected")
	}
}

func TestCompatibilityFallbackCannotBypassPolicyFailure(t *testing.T) {
	t.Parallel()
	blocked := []string{
		"APPROVAL_REQUIRED",
		"PERMISSION_DENIED",
		"VALIDATION_ERROR",
	}
	for _, code := range blocked {
		err := &executionFailure{code: code, message: "blocked", retryable: false}
		if compatibilityFallbackAllowed(err) {
			t.Fatalf("fallback must not be allowed for %s", code)
		}
	}
}

func TestCompatibilityFallbackOnlyAllowsUnavailableService(t *testing.T) {
	t.Parallel()
	if !compatibilityFallbackAllowed(errors.New("connection refused")) {
		t.Fatal("transport failure should allow the compatibility fallback")
	}
	if !compatibilityFallbackAllowed(&executionFailure{
		code: "DOWNSTREAM_UNAVAILABLE", message: "unavailable", retryable: true,
	}) {
		t.Fatal("retryable downstream outage should allow the compatibility fallback")
	}
	if compatibilityFallbackAllowed(&executionFailure{
		code: "DOWNSTREAM_UNAVAILABLE", message: "unavailable", retryable: false,
	}) {
		t.Fatal("non-retryable downstream failure must not allow the compatibility fallback")
	}
}

func TestDecisionIsBounded(t *testing.T) {
	t.Parallel()
	output, err := executeDecision(json.RawMessage(`{"operation":"equals","left":"a","right":"a"}`))
	if err != nil {
		t.Fatal(err)
	}
	if string(output) != `{"result":true}` {
		t.Fatalf("unexpected output: %s", output)
	}
}

func TestWaitHonoursCancellationAndLimit(t *testing.T) {
	t.Parallel()
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := executeWait(ctx, json.RawMessage(`{"durationMs":100}`)); err == nil {
		t.Fatal("expected cancelled wait to fail")
	}
	if _, err := executeWait(context.Background(), json.RawMessage(`{"durationMs":60001}`)); err == nil {
		t.Fatal("expected excessive wait to fail")
	}
}

func TestRetryDelayCapsExponentialBackoff(t *testing.T) {
	t.Parallel()
	policy := contract.RetryPolicy{InitialDelayMS: 100, MaxDelayMS: 250}
	if got := retryDelay(policy, 1); got != 100*time.Millisecond {
		t.Fatalf("first delay = %v", got)
	}
	if got := retryDelay(policy, 5); got != 250*time.Millisecond {
		t.Fatalf("capped delay = %v", got)
	}
}

func TestProcessBatchRejectsUnboundedLimits(t *testing.T) {
	t.Parallel()
	instance := &Worker{}
	for _, limit := range []int{0, 11} {
		if _, err := instance.ProcessBatch(context.Background(), limit); err == nil {
			t.Fatalf("expected limit %d to be rejected", limit)
		}
	}
}
