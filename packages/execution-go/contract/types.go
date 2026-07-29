package contract

import (
	"encoding/json"
	"time"
)

type RunStatus string

const (
	RunCreated    RunStatus = "created"
	RunValidating RunStatus = "validating"
	RunReady      RunStatus = "ready"
	RunQueued     RunStatus = "queued"
	RunRunning    RunStatus = "running"
	RunWaiting    RunStatus = "waiting"
	RunSucceeded  RunStatus = "succeeded"
	RunFailed     RunStatus = "failed"
	RunCancelling RunStatus = "cancelling"
	RunCancelled  RunStatus = "cancelled"
	RunTimedOut   RunStatus = "timed_out"
)

type StepStatus string

const (
	StepPending   StepStatus = "pending"
	StepBlocked   StepStatus = "blocked"
	StepReady     StepStatus = "ready"
	StepQueued    StepStatus = "queued"
	StepClaimed   StepStatus = "claimed"
	StepRunning   StepStatus = "running"
	StepRetryWait StepStatus = "retry_wait"
	StepWaiting   StepStatus = "waiting"
	StepSucceeded StepStatus = "succeeded"
	StepFailed    StepStatus = "failed"
	StepCancelled StepStatus = "cancelled"
	StepSkipped   StepStatus = "skipped"
	StepTimedOut  StepStatus = "timed_out"
)

type RetryPolicy struct {
	MaxAttempts    int `json:"maxAttempts"`
	InitialDelayMS int `json:"initialDelayMs"`
	MaxDelayMS     int `json:"maxDelayMs"`
}

type Step struct {
	ID                  string          `json:"id"`
	Index               int             `json:"index"`
	Type                string          `json:"type"`
	Name                string          `json:"name"`
	ToolID              string          `json:"toolId,omitempty"`
	DependsOn           []string        `json:"dependsOn"`
	Input               json.RawMessage `json:"input"`
	RequiredPermissions []string        `json:"requiredPermissions"`
	RetryPolicy         RetryPolicy     `json:"retryPolicy"`
	TimeoutMS           int             `json:"timeoutMs"`
	Destructive         bool            `json:"destructive"`
	ApprovalID          string          `json:"approvalId,omitempty"`
}

type Plan struct {
	ID             string    `json:"id"`
	Version        string    `json:"version"`
	RequestID      string    `json:"requestId"`
	ConversationID string    `json:"conversationId"`
	OrganisationID string    `json:"organisationId"`
	WorkspaceID    string    `json:"workspaceId"`
	UserID         string    `json:"userId"`
	AgentID        string    `json:"agentId"`
	CapabilityID   string    `json:"capabilityId"`
	SkillID        string    `json:"skillId"`
	Permissions    []string  `json:"permissions"`
	Steps          []Step    `json:"steps"`
	CreatedAt      time.Time `json:"createdAt"`
}

type CreateRunRequest struct {
	IdempotencyKey string `json:"idempotencyKey"`
	Plan           Plan   `json:"plan"`
}

type Run struct {
	ID             string    `json:"id"`
	IdempotencyKey string    `json:"idempotencyKey"`
	Plan           Plan      `json:"plan"`
	Status         RunStatus `json:"status"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type Event struct {
	ID             string          `json:"id"`
	Sequence       int64           `json:"sequence"`
	RunID          string          `json:"runId"`
	StepID         string          `json:"stepId,omitempty"`
	OrganisationID string          `json:"organisationId"`
	WorkspaceID    string          `json:"workspaceId"`
	RequestID      string          `json:"requestId"`
	Type           string          `json:"type"`
	Version        string          `json:"version"`
	Payload        json.RawMessage `json:"payload"`
	OccurredAt     time.Time       `json:"occurredAt"`
}
