package contracts

import (
	"encoding/json"
	"time"
)

type Scope struct {
	OrganisationIDs []string `json:"organisationIds,omitempty"`
	WorkspaceIDs    []string `json:"workspaceIds,omitempty"`
	TeamIDs         []string `json:"teamIds,omitempty"`
	AgentIDs        []string `json:"agentIds,omitempty"`
	CapabilityIDs   []string `json:"capabilityIds,omitempty"`
	SkillIDs        []string `json:"skillIds,omitempty"`
	ToolIDs         []string `json:"toolIds,omitempty"`
	Domains         []string `json:"domains,omitempty"`
}

type Condition struct {
	Field    string          `json:"field"`
	Operator string          `json:"operator"`
	Value    json.RawMessage `json:"value,omitempty"`
}

type ApprovalRequirements struct {
	MinimumApprovals             int      `json:"minimumApprovals"`
	RequiredRoleIDs              []string `json:"requiredRoleIds,omitempty"`
	RequiredTeamIDs              []string `json:"requiredTeamIds,omitempty"`
	ProhibitSelfApproval         bool     `json:"prohibitSelfApproval"`
	RequireDistinctApprovers     bool     `json:"requireDistinctApprovers"`
	ExpiresAfterSeconds          int      `json:"expiresAfterSeconds"`
	AuthorisationValiditySeconds int      `json:"authorisationValiditySeconds,omitempty"`
}

type PolicyDefinition struct {
	ID                   string                `json:"id"`
	Version              string                `json:"version"`
	Name                 string                `json:"name"`
	Description          string                `json:"description"`
	Category             string                `json:"category"`
	Scope                Scope                 `json:"scope"`
	Priority             int                   `json:"priority"`
	Conditions           []Condition           `json:"conditions"`
	Effect               string                `json:"effect"`
	RequiredPermissions  []string              `json:"requiredPermissions,omitempty"`
	ApprovalRequirements *ApprovalRequirements `json:"approvalRequirements,omitempty"`
	Status               string                `json:"status"`
	CreatedAt            time.Time             `json:"createdAt"`
	ActivatedAt          *time.Time            `json:"activatedAt,omitempty"`
	Checksum             string                `json:"checksum"`
	Metadata             json.RawMessage       `json:"metadata,omitempty"`
}

type EvaluationContext struct {
	RequestID          string                     `json:"requestId"`
	TraceID            string                     `json:"traceId"`
	RunID              string                     `json:"runId,omitempty"`
	StepID             string                     `json:"stepId,omitempty"`
	OrganisationID     string                     `json:"organisationId"`
	WorkspaceID        string                     `json:"workspaceId"`
	UserID             string                     `json:"userId"`
	RoleIDs            []string                   `json:"roleIds"`
	TeamIDs            []string                   `json:"teamIds"`
	PermissionIDs      []string                   `json:"permissionIds"`
	AgentID            string                     `json:"agentId"`
	CapabilityID       string                     `json:"capabilityId"`
	SkillID            string                     `json:"skillId,omitempty"`
	ToolID             string                     `json:"toolId"`
	ToolVersion        string                     `json:"toolVersion"`
	Domain             string                     `json:"domain"`
	Operation          string                     `json:"operation"`
	ExecutionMode      string                     `json:"executionMode"`
	Sensitivity        string                     `json:"sensitivity"`
	DataClassification string                     `json:"dataClassification"`
	Attributes         map[string]json.RawMessage `json:"attributes,omitempty"`
}

type PolicyDecision struct {
	DecisionID           string                        `json:"decisionId"`
	PolicyVersionIDs     []string                      `json:"policyVersionIds"`
	Result               string                        `json:"result"`
	RiskLevel            string                        `json:"riskLevel"`
	RequiredPermissions  []string                      `json:"requiredPermissions"`
	ApprovalRequirements *ResolvedApprovalRequirements `json:"approvalRequirements,omitempty"`
	ReasonCodes          []string                      `json:"reasonCodes"`
	SafeExplanation      string                        `json:"safeExplanation"`
	EvaluatedAt          time.Time                     `json:"evaluatedAt"`
}

type ResolvedApprovalRequirements struct {
	MinimumApprovals         int        `json:"minimumApprovals"`
	EligibleRoleIDs          []string   `json:"eligibleRoleIds"`
	EligibleTeamIDs          []string   `json:"eligibleTeamIds"`
	ProhibitSelfApproval     bool       `json:"prohibitSelfApproval"`
	RequireDistinctApprovers bool       `json:"requireDistinctApprovers"`
	ExpiresAt                time.Time  `json:"expiresAt"`
	AuthorisationExpiresAt   *time.Time `json:"authorisationExpiresAt,omitempty"`
}

type ApprovalRequest struct {
	ID                       string     `json:"id"`
	Version                  string     `json:"version"`
	RequestID                string     `json:"requestId"`
	TraceID                  string     `json:"traceId"`
	RunID                    string     `json:"runId"`
	StepID                   string     `json:"stepId,omitempty"`
	OrganisationID           string     `json:"organisationId"`
	WorkspaceID              string     `json:"workspaceId"`
	RequestedByUserID        string     `json:"requestedByUserId"`
	RequestedByAgentID       string     `json:"requestedByAgentId,omitempty"`
	PolicyDecisionID         string     `json:"policyDecisionId"`
	PolicyVersionIDs         []string   `json:"policyVersionIds"`
	CapabilityID             string     `json:"capabilityId"`
	SkillID                  string     `json:"skillId,omitempty"`
	ToolID                   string     `json:"toolId"`
	ToolVersion              string     `json:"toolVersion"`
	Domain                   string     `json:"domain"`
	Operation                string     `json:"operation"`
	RiskLevel                string     `json:"riskLevel"`
	Title                    string     `json:"title"`
	SafeSummary              string     `json:"safeSummary"`
	ResourceType             string     `json:"resourceType,omitempty"`
	ResourceID               string     `json:"resourceId,omitempty"`
	RequestFingerprint       string     `json:"requestFingerprint"`
	MinimumApprovals         int        `json:"minimumApprovals"`
	EligibleRoleIDs          []string   `json:"eligibleRoleIds"`
	EligibleTeamIDs          []string   `json:"eligibleTeamIds"`
	ProhibitSelfApproval     bool       `json:"prohibitSelfApproval"`
	RequireDistinctApprovers bool       `json:"requireDistinctApprovers"`
	Status                   string     `json:"status"`
	ExpiresAt                time.Time  `json:"expiresAt"`
	AuthorisationExpiresAt   *time.Time `json:"authorisationExpiresAt,omitempty"`
	CreatedAt                time.Time  `json:"createdAt"`
	ResolvedAt               *time.Time `json:"resolvedAt,omitempty"`
}

type ApprovalDecision struct {
	ID                string          `json:"id"`
	ApprovalRequestID string          `json:"approvalRequestId"`
	OrganisationID    string          `json:"organisationId"`
	WorkspaceID       string          `json:"workspaceId"`
	ApproverUserID    string          `json:"approverUserId"`
	ApproverRoleIDs   []string        `json:"approverRoleIds"`
	ApproverTeamIDs   []string        `json:"approverTeamIds"`
	Decision          string          `json:"decision"`
	Reason            string          `json:"reason,omitempty"`
	Evidence          json.RawMessage `json:"evidence"`
	CreatedAt         time.Time       `json:"createdAt"`
}

type AuditActor struct {
	Type           string `json:"type"`
	ID             string `json:"id"`
	ImpersonatedBy string `json:"impersonatedBy,omitempty"`
}
type AuditTarget struct {
	Type string `json:"type"`
	ID   string `json:"id,omitempty"`
}
type AuditEvent struct {
	ID             string          `json:"id"`
	Version        string          `json:"version"`
	Sequence       int64           `json:"sequence"`
	EventType      string          `json:"eventType"`
	Category       string          `json:"category"`
	OrganisationID string          `json:"organisationId"`
	WorkspaceID    string          `json:"workspaceId,omitempty"`
	Actor          AuditActor      `json:"actor"`
	Action         string          `json:"action"`
	Target         *AuditTarget    `json:"target,omitempty"`
	RequestID      string          `json:"requestId"`
	TraceID        string          `json:"traceId,omitempty"`
	RunID          string          `json:"runId,omitempty"`
	StepID         string          `json:"stepId,omitempty"`
	Outcome        string          `json:"outcome"`
	ReasonCode     string          `json:"reasonCode,omitempty"`
	SafeMetadata   json.RawMessage `json:"safeMetadata,omitempty"`
	OccurredAt     time.Time       `json:"occurredAt"`
	IngestedAt     time.Time       `json:"ingestedAt"`
	PreviousHash   string          `json:"previousHash,omitempty"`
	EventHash      string          `json:"eventHash"`
}

type ServiceError struct {
	Code      string          `json:"code"`
	Message   string          `json:"message"`
	RequestID string          `json:"requestId"`
	Retryable bool            `json:"retryable"`
	Metadata  json.RawMessage `json:"safeMetadata,omitempty"`
}

func (e *ServiceError) Error() string { return e.Code + ": " + e.Message }
