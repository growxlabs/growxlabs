package contract

import (
	"encoding/json"
	"time"
)

type Scope struct {
	OrganisationID string   `json:"organisationId"`
	WorkspaceID    string   `json:"workspaceId"`
	TeamID         string   `json:"teamId,omitempty"`
	UserID         string   `json:"userId"`
	Permissions    []string `json:"permissions"`
}

type ToolDefinition struct {
	ID                    string          `json:"id"`
	Version               string          `json:"version"`
	Name                  string          `json:"name"`
	Description           string          `json:"description"`
	Domain                string          `json:"domain"`
	Operation             string          `json:"operation"`
	InputSchema           json.RawMessage `json:"inputSchema"`
	OutputSchema          json.RawMessage `json:"outputSchema"`
	RequiredPermissions   []string        `json:"requiredPermissions"`
	RequiredCapabilityIDs []string        `json:"requiredCapabilityIds"`
	AllowedSkillIDs       []string        `json:"allowedSkillIds"`
	AllowedAgentIDs       []string        `json:"allowedAgentIds"`
	Sensitivity           string          `json:"sensitivity"`
	ExecutionMode         string          `json:"executionMode"`
	Idempotent            bool            `json:"idempotent"`
	Retryable             bool            `json:"retryable"`
	RequiresApproval      bool            `json:"requiresApproval"`
	TimeoutMS             int             `json:"timeoutMs"`
	Status                string          `json:"status"`
	Adapter               string          `json:"adapter"`
}

type CapabilityDefinition struct {
	ID                  string   `json:"id"`
	Version             string   `json:"version"`
	Name                string   `json:"name"`
	Description         string   `json:"description"`
	Domain              string   `json:"domain"`
	RequiredPermissions []string `json:"requiredPermissions"`
	AllowedAgentIDs     []string `json:"allowedAgentIds"`
	AllowedSkillIDs     []string `json:"allowedSkillIds"`
	AllowedToolIDs      []string `json:"allowedToolIds"`
	OrganisationScope   []string `json:"organisationScope,omitempty"`
	WorkspaceScope      []string `json:"workspaceScope,omitempty"`
	Status              string   `json:"status"`
}

type SkillExecutionPolicy struct {
	MaxSteps           int      `json:"maxSteps"`
	ParallelismAllowed bool     `json:"parallelismAllowed"`
	RequiresApproval   bool     `json:"requiresApproval"`
	AllowedStepTypes   []string `json:"allowedStepTypes"`
}

type SkillDefinition struct {
	ID                  string               `json:"id"`
	Version             string               `json:"version"`
	Name                string               `json:"name"`
	Description         string               `json:"description"`
	Domain              string               `json:"domain"`
	CapabilityIDs       []string             `json:"capabilityIds"`
	AllowedAgentIDs     []string             `json:"allowedAgentIds"`
	AllowedToolIDs      []string             `json:"allowedToolIds"`
	RequiredPermissions []string             `json:"requiredPermissions"`
	InputSchema         json.RawMessage      `json:"inputSchema"`
	OutputSchema        json.RawMessage      `json:"outputSchema"`
	ExecutionPolicy     SkillExecutionPolicy `json:"executionPolicy"`
	Status              string               `json:"status"`
}

type ToolExecutionRequest struct {
	RequestID      string          `json:"requestId"`
	TraceID        string          `json:"traceId"`
	RunID          string          `json:"runId"`
	StepID         string          `json:"stepId"`
	AttemptID      string          `json:"attemptId"`
	Attempt        int             `json:"attempt"`
	Scope          Scope           `json:"scope"`
	AgentID        string          `json:"agentId"`
	CapabilityID   string          `json:"capabilityId"`
	SkillID        string          `json:"skillId,omitempty"`
	ToolID         string          `json:"toolId"`
	ToolVersion    string          `json:"toolVersion"`
	Input          json.RawMessage `json:"input"`
	IdempotencyKey string          `json:"idempotencyKey"`
	Deadline       time.Time       `json:"deadline"`
	ApprovalID     string          `json:"approvalId,omitempty"`
}

type ToolExecutionResult struct {
	RequestID       string          `json:"requestId"`
	RunID           string          `json:"runId"`
	StepID          string          `json:"stepId"`
	AttemptID       string          `json:"attemptId"`
	ToolID          string          `json:"toolId"`
	ToolVersion     string          `json:"toolVersion"`
	Status          string          `json:"status"`
	Output          json.RawMessage `json:"output,omitempty"`
	Error           *ServiceError   `json:"error,omitempty"`
	ExecutionTimeMS int64           `json:"executionTimeMs"`
	IdempotencyKey  string          `json:"idempotencyKey"`
	CompletedAt     time.Time       `json:"completedAt"`
}

type ServiceError struct {
	Code         string          `json:"code"`
	Message      string          `json:"message"`
	RequestID    string          `json:"requestId"`
	Retryable    bool            `json:"retryable"`
	SafeMetadata json.RawMessage `json:"safeMetadata,omitempty"`
}

func (e *ServiceError) Error() string { return e.Code + ": " + e.Message }
