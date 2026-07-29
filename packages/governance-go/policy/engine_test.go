package policy

import (
	"encoding/json"
	"testing"
	"time"

	"growx/commandcenter/governance/contracts"
)

func definition(t *testing.T, effect string, priority int) contracts.PolicyDefinition {
	t.Helper()
	value := contracts.PolicyDefinition{
		ID: "finance-control", Version: "1.0.0", Name: "Finance control",
		Category: "financial", Priority: priority, Effect: effect, Status: "active",
		Conditions: []contracts.Condition{{Field: "domain", Operator: "equals", Value: json.RawMessage(`"finance"`)}},
		CreatedAt:  time.Now(),
	}
	if effect == "require_approval" {
		value.ApprovalRequirements = &contracts.ApprovalRequirements{
			MinimumApprovals: 2, ProhibitSelfApproval: true, RequireDistinctApprovers: true,
			ExpiresAfterSeconds: 3600,
		}
	}
	checksum, err := Checksum(value)
	if err != nil {
		t.Fatal(err)
	}
	value.Checksum = checksum
	return value
}

func TestRegistryRejectsDuplicateAndInvalidConditions(t *testing.T) {
	registry := NewRegistry()
	value := definition(t, "allow", 1)
	if err := registry.Register(value); err != nil {
		t.Fatal(err)
	}
	if err := registry.Register(value); err == nil {
		t.Fatal("expected duplicate version rejection")
	}
	value.ID, value.Conditions[0].Operator = "invalid", "eval"
	value.Checksum, _ = Checksum(value)
	if err := registry.Register(value); err == nil {
		t.Fatal("expected arbitrary condition rejection")
	}
}

func TestDenyOverridesAllowDeterministically(t *testing.T) {
	allow := definition(t, "allow", 100)
	deny := definition(t, "deny", 1)
	deny.ID = "legal-deny"
	deny.Checksum, _ = Checksum(deny)
	ctx := contracts.EvaluationContext{RequestID: "r1", OrganisationID: "o1", WorkspaceID: "w1", UserID: "u1", Domain: "finance", Operation: "read", ExecutionMode: "read"}
	decision := Evaluate(ctx, []contracts.PolicyDefinition{allow, deny}, time.Unix(100, 0))
	if decision.Result != "denied" || decision.PolicyVersionIDs[0] != "legal-deny@1.0.0" {
		t.Fatalf("unexpected decision: %#v", decision)
	}
}

func TestApprovalAndSensitiveDefaultDeny(t *testing.T) {
	approval := definition(t, "require_approval", 10)
	ctx := contracts.EvaluationContext{RequestID: "r1", Domain: "finance", Operation: "payment.initiate", ExecutionMode: "write"}
	decision := Evaluate(ctx, []contracts.PolicyDefinition{approval}, time.Unix(100, 0))
	if decision.Result != "approval_required" || decision.ApprovalRequirements.MinimumApprovals != 2 {
		t.Fatalf("unexpected approval decision: %#v", decision)
	}
	ctx.Domain, ctx.Operation = "payment", "initiate"
	if result := Evaluate(ctx, nil, time.Unix(100, 0)); result.Result != "denied" || result.RiskLevel != "critical" {
		t.Fatalf("sensitive default deny failed: %#v", result)
	}
}

func TestRiskClassification(t *testing.T) {
	tests := []struct {
		context contracts.EvaluationContext
		want    string
	}{
		{contracts.EvaluationContext{ExecutionMode: "read"}, "low"},
		{contracts.EvaluationContext{ExecutionMode: "write"}, "moderate"},
		{contracts.EvaluationContext{DataClassification: "restricted"}, "high"},
		{contracts.EvaluationContext{Domain: "employee", Operation: "terminate"}, "critical"},
	}
	for _, test := range tests {
		if got := ClassifyRisk(test.context); got != test.want {
			t.Fatalf("risk=%s want=%s", got, test.want)
		}
	}
}
