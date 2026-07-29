package state

import (
	"testing"

	"growx/commandcenter/execution/contract"
)

func TestRunTransitions(t *testing.T) {
	t.Parallel()
	if err := ValidateRunTransition(contract.RunQueued, contract.RunRunning); err != nil {
		t.Fatalf("expected queued -> running to be valid: %v", err)
	}
	if err := ValidateRunTransition(contract.RunSucceeded, contract.RunRunning); err == nil {
		t.Fatal("expected terminal run transition to be rejected")
	}
}

func TestStepTransitions(t *testing.T) {
	t.Parallel()
	if err := ValidateStepTransition(contract.StepRunning, contract.StepRetryWait); err != nil {
		t.Fatalf("expected retry-wait transition to be valid: %v", err)
	}
	if err := ValidateStepTransition(contract.StepSucceeded, contract.StepRunning); err == nil {
		t.Fatal("expected terminal step transition to be rejected")
	}
}
