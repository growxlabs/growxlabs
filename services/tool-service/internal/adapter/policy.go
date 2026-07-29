package adapter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/phase4/contract"
)

type PolicyValidator struct {
	baseURL     string
	secret      string
	environment string
	client      *http.Client
}

func NewPolicyValidator(baseURL, secret, environment string) *PolicyValidator {
	return &PolicyValidator{
		baseURL: strings.TrimRight(baseURL, "/"), secret: secret, environment: environment,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (v *PolicyValidator) Validate(ctx context.Context, input contract.ToolExecutionRequest) *contract.ServiceError {
	capability := map[string]any{
		"capabilityId": input.CapabilityID, "version": "", "agentId": input.AgentID,
		"skillId": input.SkillID, "toolId": input.ToolID, "scope": input.Scope,
	}
	if serviceError := v.resolve(ctx, input.RequestID, "/internal/v1/capabilities/resolve", capability); serviceError != nil {
		return serviceError
	}
	if input.SkillID == "" {
		return nil
	}
	skill := map[string]any{
		"skillId": input.SkillID, "version": "", "agentId": input.AgentID,
		"capabilityId": input.CapabilityID, "toolIds": []string{input.ToolID},
		"stepTypes": []string{"tool"}, "stepCount": 1, "scope": input.Scope,
	}
	return v.resolve(ctx, input.RequestID, "/internal/v1/skills/resolve", skill)
}

func (v *PolicyValidator) resolve(ctx context.Context, requestID, path string, input any) *contract.ServiceError {
	body, err := json.Marshal(input)
	if err != nil {
		return policyError("INTERNAL_FAILURE", "policy request could not be encoded", requestID, false)
	}
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer: "tool-service", Audience: "internal-api-gateway", Service: "tool-service",
		Env: v.environment, RequestID: requestID, IssuedAt: now.Unix(),
		ExpiresAt: now.Add(time.Minute).Unix(),
	}, v.secret)
	if err != nil {
		return policyError("INTERNAL_FAILURE", "policy authentication could not be created", requestID, false)
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, v.baseURL, bytes.NewReader(body))
	if err != nil {
		return policyError("INTERNAL_FAILURE", "policy request could not be created", requestID, false)
	}
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-Request-ID", requestID)
	request.Header.Set("X-Service-Name", "tool-service")
	request.Header.Set("X-GXL-Internal-Path", path)
	response, err := v.client.Do(request)
	if err != nil {
		return policyError("DOWNSTREAM_UNAVAILABLE", "policy service is unavailable", requestID, true)
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return policyError("DOWNSTREAM_UNAVAILABLE", "policy response could not be read", requestID, true)
	}
	if response.StatusCode >= 200 && response.StatusCode < 300 {
		return nil
	}
	var envelope struct {
		Error *contract.ServiceError `json:"error"`
	}
	if json.Unmarshal(responseBody, &envelope) == nil && envelope.Error != nil {
		envelope.Error.RequestID = requestID
		return envelope.Error
	}
	return policyError("DOWNSTREAM_UNAVAILABLE", fmt.Sprintf("policy service returned status %d", response.StatusCode), requestID, response.StatusCode >= 500)
}

func policyError(code, message, requestID string, retryable bool) *contract.ServiceError {
	return &contract.ServiceError{Code: code, Message: message, RequestID: requestID, Retryable: retryable}
}
