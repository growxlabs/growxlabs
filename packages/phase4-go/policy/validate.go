package policy

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"growx/commandcenter/phase4/contract"
)

const MaxPayloadBytes = 1 << 20

func ValidateToolDefinition(definition contract.ToolDefinition, knownAdapters map[string]bool) error {
	if definition.ID == "" || definition.Version == "" || definition.Name == "" || definition.Operation == "" {
		return errors.New("tool identity, version, name and operation are required")
	}
	if !contains([]string{"crm", "finance", "hr", "projects", "marketing", "system"}, definition.Domain) {
		return fmt.Errorf("unsupported tool domain %q", definition.Domain)
	}
	if !contains([]string{"low", "moderate", "high", "restricted"}, definition.Sensitivity) {
		return fmt.Errorf("unsupported sensitivity %q", definition.Sensitivity)
	}
	if !contains([]string{"read", "write", "destructive"}, definition.ExecutionMode) {
		return fmt.Errorf("unsupported execution mode %q", definition.ExecutionMode)
	}
	if !contains([]string{"active", "disabled", "deprecated"}, definition.Status) {
		return fmt.Errorf("unsupported status %q", definition.Status)
	}
	if definition.TimeoutMS < 100 || definition.TimeoutMS > 300_000 {
		return errors.New("tool timeout is outside server policy")
	}
	if !knownAdapters[definition.Adapter] {
		return fmt.Errorf("unknown adapter %q", definition.Adapter)
	}
	if !validObjectSchema(definition.InputSchema) || !validObjectSchema(definition.OutputSchema) {
		return errors.New("tool input and output schemas must be JSON object schemas")
	}
	return nil
}

func ValidateExecution(request contract.ToolExecutionRequest, definition contract.ToolDefinition, now time.Time) *contract.ServiceError {
	fail := func(code, message string, retryable bool) *contract.ServiceError {
		return &contract.ServiceError{Code: code, Message: message, RequestID: request.RequestID, Retryable: retryable}
	}
	if request.RequestID == "" || request.TraceID == "" || request.RunID == "" ||
		request.StepID == "" || request.AttemptID == "" || request.IdempotencyKey == "" {
		return fail("INVALID_INPUT", "execution correlation and idempotency fields are required", false)
	}
	if request.Scope.OrganisationID == "" || request.Scope.WorkspaceID == "" || request.Scope.UserID == "" {
		return fail("ORGANISATION_MISMATCH", "authoritative tenant and user scope are required", false)
	}
	if request.ToolID != definition.ID || request.ToolVersion != definition.Version {
		return fail("TOOL_VERSION_UNSUPPORTED", "tool ID or version does not match the resolved definition", false)
	}
	if request.AgentID == "" || !contains(definition.AllowedAgentIDs, request.AgentID) {
		return fail("TOOL_FORBIDDEN", "agent is not allowed to execute this tool", false)
	}
	if !contains(definition.RequiredCapabilityIDs, request.CapabilityID) {
		return fail("CAPABILITY_FORBIDDEN", "capability is not allowed for this tool", false)
	}
	if len(definition.AllowedSkillIDs) > 0 && request.SkillID != "" && !contains(definition.AllowedSkillIDs, request.SkillID) {
		return fail("SKILL_FORBIDDEN", "skill is not allowed for this tool", false)
	}
	for _, permission := range definition.RequiredPermissions {
		if !contains(request.Scope.Permissions, permission) {
			return fail("USER_NOT_AUTHORISED", "required user permission is unavailable", false)
		}
	}
	if request.Deadline.IsZero() || !request.Deadline.After(now) ||
		request.Deadline.After(now.Add(time.Duration(definition.TimeoutMS)*time.Millisecond)) {
		return fail("TIMEOUT", "execution deadline is invalid or outside tool policy", false)
	}
	if len(request.Input) > MaxPayloadBytes || !json.Valid(request.Input) {
		return fail("INVALID_INPUT", "tool input is invalid or exceeds the payload limit", false)
	}
	if err := ValidateJSONAgainstSchema(request.Input, definition.InputSchema); err != nil {
		return fail("INVALID_INPUT", err.Error(), false)
	}
	return nil
}

func ValidateJSONAgainstSchema(payload, schema json.RawMessage) error {
	var value map[string]json.RawMessage
	if err := json.Unmarshal(payload, &value); err != nil {
		return errors.New("payload must be a JSON object")
	}
	var definition struct {
		Type       string                     `json:"type"`
		Required   []string                   `json:"required"`
		Properties map[string]json.RawMessage `json:"properties"`
	}
	decoder := json.NewDecoder(bytes.NewReader(schema))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&definition); err != nil || definition.Type != "object" {
		return errors.New("invalid JSON object schema")
	}
	for _, required := range definition.Required {
		if _, exists := value[required]; !exists {
			return fmt.Errorf("required field %q is missing", required)
		}
	}
	return nil
}

func validObjectSchema(schema json.RawMessage) bool {
	var value struct {
		Type string `json:"type"`
	}
	return json.Unmarshal(schema, &value) == nil && value.Type == "object"
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
