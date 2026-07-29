package contract

import (
	"encoding/json"
	"testing"
)

func TestValidatePlanRejectsCycle(t *testing.T) {
	t.Parallel()
	plan := validPlan()
	plan.Steps = append(plan.Steps, Step{
		ID: "5f2ff3b8-b071-407e-a0dd-2ed1afbf007b", Index: 1, Type: "wait", DependsOn: []string{"f3852451-1993-4ab6-ab90-dd403f9da2ac"},
		Input: json.RawMessage(`{"durationMs":0}`), TimeoutMS: 100,
		RetryPolicy: RetryPolicy{MaxAttempts: 1},
	})
	plan.Steps[0].DependsOn = []string{"5f2ff3b8-b071-407e-a0dd-2ed1afbf007b"}
	if err := ValidatePlan(plan); err == nil {
		t.Fatal("expected dependency cycle to be rejected")
	}
}

func TestValidatePlanAcceptsBoundedDAG(t *testing.T) {
	t.Parallel()
	if err := ValidatePlan(validPlan()); err != nil {
		t.Fatalf("valid plan rejected: %v", err)
	}
}

func validPlan() Plan {
	return Plan{
		ID: "1544c856-d05a-47e2-9373-0a27d0a5312e", Version: requiredPlanV1, RequestID: "request-1",
		OrganisationID: "org-1", WorkspaceID: "workspace-1", UserID: "user-1",
		AgentID: "agent-1", CapabilityID: "capability-1",
		Steps: []Step{{
			ID: "f3852451-1993-4ab6-ab90-dd403f9da2ac", Index: 0, Type: "wait", DependsOn: []string{},
			Input: json.RawMessage(`{"durationMs":0}`), TimeoutMS: 100,
			RetryPolicy: RetryPolicy{MaxAttempts: 1},
		}},
	}
}
