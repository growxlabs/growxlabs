package adapter

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
	governanceapprovals "growx/commandcenter/governance/approvals"
	governancecontracts "growx/commandcenter/governance/contracts"
	"growx/commandcenter/phase4/contract"
)

type GovernanceClient struct {
	gatewayURL, secret, environment string
	client                          *http.Client
}

func NewGovernanceClient(gatewayURL, secret, environment string) *GovernanceClient {
	return &GovernanceClient{
		gatewayURL: strings.TrimRight(gatewayURL, "/"), secret: secret, environment: environment,
		client: &http.Client{Timeout: 20 * time.Second},
	}
}

type GovernanceEvaluation struct {
	Decision           governancecontracts.PolicyDecision `json:"decision"`
	ContextFingerprint string                             `json:"contextFingerprint"`
}

func (c *GovernanceClient) Authorise(ctx context.Context, input contract.ToolExecutionRequest, definition contract.ToolDefinition) *contract.ServiceError {
	evaluationInput := governancecontracts.EvaluationContext{
		RequestID: input.RequestID, TraceID: input.TraceID, RunID: input.RunID, StepID: input.StepID,
		OrganisationID: input.Scope.OrganisationID, WorkspaceID: input.Scope.WorkspaceID,
		UserID: input.Scope.UserID, AgentID: input.AgentID, CapabilityID: input.CapabilityID,
		SkillID: input.SkillID, ToolID: input.ToolID, ToolVersion: input.ToolVersion,
		Domain: definition.Domain, Operation: definition.Operation, ExecutionMode: definition.ExecutionMode,
		Sensitivity: definition.Sensitivity, DataClassification: classification(definition.Sensitivity),
		Attributes: map[string]json.RawMessage{"static_requires_approval": json.RawMessage(boolJSON(definition.RequiresApproval))},
	}
	var evaluation GovernanceEvaluation
	if serviceError := c.call(ctx, input, "/internal/v1/governance/policy/evaluate", evaluationInput, &evaluation); serviceError != nil {
		return serviceError
	}
	switch evaluation.Decision.Result {
	case "denied", "additional_permission_required":
		return governanceError("POLICY_DENIED", evaluation.Decision.SafeExplanation, input.RequestID, false, nil)
	case "approval_required":
		if input.ApprovalID == "" {
			approval := governancecontracts.ApprovalRequest{
				RequestID: input.RequestID, TraceID: input.TraceID, RunID: input.RunID, StepID: input.StepID,
				RequestedByAgentID: input.AgentID, PolicyDecisionID: evaluation.Decision.DecisionID,
				PolicyVersionIDs: evaluation.Decision.PolicyVersionIDs, CapabilityID: input.CapabilityID,
				SkillID: input.SkillID, ToolID: input.ToolID, ToolVersion: input.ToolVersion,
				Domain: definition.Domain, Operation: definition.Operation, RiskLevel: evaluation.Decision.RiskLevel,
				Title:              "Approval required: " + definition.Name,
				SafeSummary:        "A governed " + definition.Domain + " operation requires approval before execution.",
				RequestFingerprint: evaluation.ContextFingerprint,
			}
			var created struct {
				Approval governancecontracts.ApprovalRequest `json:"approval"`
			}
			payload := map[string]any{"approval": approval, "idempotencyKey": input.IdempotencyKey + ":approval"}
			if serviceError := c.call(ctx, input, "/internal/v1/governance/approvals/create", payload, &created); serviceError != nil {
				return serviceError
			}
			metadata, _ := json.Marshal(map[string]string{"approvalRequestId": created.Approval.ID})
			return governanceError("APPROVAL_REQUIRED", "operation is blocked pending approval", input.RequestID, false, metadata)
		}
		reference := governanceapprovals.ApprovalReference{
			ApprovalRequestID: input.ApprovalID, OrganisationID: input.Scope.OrganisationID,
			WorkspaceID: input.Scope.WorkspaceID, RunID: input.RunID, StepID: input.StepID,
			CapabilityID: input.CapabilityID, SkillID: input.SkillID, ToolID: input.ToolID,
			ToolVersion: input.ToolVersion, Operation: definition.Operation,
			PolicyDecisionID: evaluation.Decision.DecisionID, RequestFingerprint: evaluation.ContextFingerprint,
		}
		payload := map[string]any{"reference": reference, "currentFingerprint": evaluation.ContextFingerprint}
		var validation struct {
			Valid bool `json:"valid"`
		}
		if serviceError := c.call(ctx, input, "/internal/v1/governance/approvals/validate", payload, &validation); serviceError != nil {
			return serviceError
		}
		if !validation.Valid {
			return governanceError("APPROVAL_REQUIREMENTS_NOT_MET", "approval validation failed", input.RequestID, false, nil)
		}
	}
	return nil
}

func (c *GovernanceClient) call(ctx context.Context, input contract.ToolExecutionRequest, path string, payload any, result any) *contract.ServiceError {
	body, err := json.Marshal(payload)
	if err != nil {
		return governanceError("INTERNAL_FAILURE", "governance request encoding failed", input.RequestID, false, nil)
	}
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer: "tool-service", Audience: "internal-api-gateway", Service: "tool-service",
		Env: c.environment, RequestID: input.RequestID, IssuedAt: now.Unix(), ExpiresAt: now.Add(time.Minute).Unix(),
	}, c.secret)
	if err != nil {
		return governanceError("INTERNAL_FAILURE", "governance authentication failed", input.RequestID, false, nil)
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, c.gatewayURL, bytes.NewReader(body))
	if err != nil {
		return governanceError("INTERNAL_FAILURE", "governance request creation failed", input.RequestID, false, nil)
	}
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-Request-ID", input.RequestID)
	request.Header.Set("X-GXL-Internal-Path", path)
	request.Header.Set("X-GXL-Organisation-ID", input.Scope.OrganisationID)
	request.Header.Set("X-GXL-Workspace-ID", input.Scope.WorkspaceID)
	request.Header.Set("X-GXL-User-ID", input.Scope.UserID)
	response, err := c.client.Do(request)
	if err != nil {
		return governanceError("DOWNSTREAM_UNAVAILABLE", "governance service is unavailable", input.RequestID, true, nil)
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return governanceError("DOWNSTREAM_UNAVAILABLE", "governance response could not be read", input.RequestID, true, nil)
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		var envelope struct {
			Error *governancecontracts.ServiceError `json:"error"`
		}
		if json.Unmarshal(responseBody, &envelope) == nil && envelope.Error != nil {
			return governanceError(envelope.Error.Code, envelope.Error.Message, input.RequestID, envelope.Error.Retryable, envelope.Error.Metadata)
		}
		return governanceError("DOWNSTREAM_UNAVAILABLE", "governance request failed", input.RequestID, response.StatusCode >= 500, nil)
	}
	if json.Unmarshal(responseBody, result) != nil {
		return governanceError("INVALID_OUTPUT", "governance response was invalid", input.RequestID, false, nil)
	}
	return nil
}

func classification(sensitivity string) string {
	switch sensitivity {
	case "restricted":
		return "restricted"
	case "high":
		return "confidential"
	default:
		return "internal"
	}
}
func boolJSON(value bool) string {
	if value {
		return "true"
	}
	return "false"
}
func governanceError(code, message, requestID string, retryable bool, metadata json.RawMessage) *contract.ServiceError {
	return &contract.ServiceError{Code: code, Message: message, RequestID: requestID, Retryable: retryable, SafeMetadata: metadata}
}
