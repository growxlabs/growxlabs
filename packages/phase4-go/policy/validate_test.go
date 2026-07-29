package policy

import (
	"encoding/json"
	"testing"
	"time"

	"growx/commandcenter/phase4/contract"
)

func TestValidateExecutionAcceptsAuthorisedRequest(t *testing.T) {
	t.Parallel()
	now := time.Now()
	definition := testDefinition()
	request := testRequest(now)
	if serviceError := ValidateExecution(request, definition, now); serviceError != nil {
		t.Fatalf("valid request rejected: %v", serviceError)
	}
}

func TestValidateExecutionRejectsForgedPermissionAndAgent(t *testing.T) {
	t.Parallel()
	now := time.Now()
	definition := testDefinition()
	request := testRequest(now)
	request.Scope.Permissions = nil
	if serviceError := ValidateExecution(request, definition, now); serviceError == nil || serviceError.Code != "USER_NOT_AUTHORISED" {
		t.Fatalf("expected permission rejection, got %#v", serviceError)
	}
	request = testRequest(now)
	request.AgentID = "forged-agent"
	if serviceError := ValidateExecution(request, definition, now); serviceError == nil || serviceError.Code != "TOOL_FORBIDDEN" {
		t.Fatalf("expected agent rejection, got %#v", serviceError)
	}
}

func TestValidateExecutionBlocksApprovalAndInvalidInput(t *testing.T) {
	t.Parallel()
	now := time.Now()
	definition := testDefinition()
	definition.RequiresApproval = true
	request := testRequest(now)
	if serviceError := ValidateExecution(request, definition, now); serviceError != nil {
		t.Fatalf("approval is revalidated by Phase 5 governance, got %#v", serviceError)
	}
	definition.RequiresApproval = false
	request.Input = json.RawMessage(`{}`)
	if serviceError := ValidateExecution(request, definition, now); serviceError == nil || serviceError.Code != "INVALID_INPUT" {
		t.Fatalf("expected schema rejection, got %#v", serviceError)
	}
}

func TestValidateToolDefinitionRejectsUnknownAdapter(t *testing.T) {
	t.Parallel()
	definition := testDefinition()
	if err := ValidateToolDefinition(definition, map[string]bool{"domain": true}); err == nil {
		t.Fatal("expected unknown adapter rejection")
	}
}

func testDefinition() contract.ToolDefinition {
	return contract.ToolDefinition{
		ID: "create_lead", Version: "1.0.0", Name: "Create lead",
		Description: "Create lead", Domain: "crm", Operation: "leads.create",
		InputSchema:           json.RawMessage(`{"type":"object","properties":{"businessName":{"type":"string"}},"required":["businessName"]}`),
		OutputSchema:          json.RawMessage(`{"type":"object","properties":{},"required":[]}`),
		RequiredPermissions:   []string{"leads:write"},
		RequiredCapabilityIDs: []string{"sales.leads"},
		AllowedSkillIDs:       []string{"skill_lead_qualification"},
		AllowedAgentIDs:       []string{"agent_sales"}, Sensitivity: "moderate",
		ExecutionMode: "write", Idempotent: true, Retryable: true,
		TimeoutMS: 10_000, Status: "active", Adapter: "legacy-nextjs",
	}
}

func testRequest(now time.Time) contract.ToolExecutionRequest {
	return contract.ToolExecutionRequest{
		RequestID: "request-1", TraceID: "trace-1",
		RunID:     "1544c856-d05a-47e2-9373-0a27d0a5312e",
		StepID:    "f3852451-1993-4ab6-ab90-dd403f9da2ac",
		AttemptID: "attempt-1", Attempt: 1,
		Scope: contract.Scope{
			OrganisationID: "org-1", WorkspaceID: "workspace-1",
			UserID: "user-1", Permissions: []string{"leads:write"},
		},
		AgentID: "agent_sales", CapabilityID: "sales.leads",
		SkillID: "skill_lead_qualification", ToolID: "create_lead",
		ToolVersion: "1.0.0", Input: json.RawMessage(`{"businessName":"Acme"}`),
		IdempotencyKey: "key-1", Deadline: now.Add(5 * time.Second),
	}
}
