package adapter

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/phase4/contract"
)

type LegacyNextJS struct {
	baseURL     string
	secret      string
	environment string
	client      *http.Client
}

func NewLegacyNextJS(baseURL, secret, environment string) *LegacyNextJS {
	return &LegacyNextJS{
		baseURL: baseURL, secret: secret, environment: environment,
		client: &http.Client{Timeout: 35 * time.Second},
	}
}

func (a *LegacyNextJS) Execute(ctx context.Context, request contract.ToolExecutionRequest) (json.RawMessage, error) {
	body, err := json.Marshal(map[string]any{
		"runId": request.RunID, "stepId": request.StepID, "attempt": request.Attempt,
		"organisationId": request.Scope.OrganisationID,
		"workspaceId":    request.Scope.WorkspaceID, "userId": request.Scope.UserID,
		"requestId": request.RequestID, "conversationId": request.RunID,
		"agentId": request.AgentID, "capabilityId": request.CapabilityID,
		"skillId": request.SkillID, "toolId": request.ToolID,
		"input":               json.RawMessage(request.Input),
		"requiredPermissions": request.Scope.Permissions,
	})
	if err != nil {
		return nil, err
	}
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer: "tool-service", Audience: "gxl-web", Service: "tool-service",
		Env: a.environment, RequestID: request.RequestID,
		IssuedAt: now.Unix(), ExpiresAt: now.Add(2 * time.Minute).Unix(),
	}, a.secret)
	if err != nil {
		return nil, err
	}
	httpRequest, err := http.NewRequestWithContext(
		ctx, http.MethodPost, a.baseURL+"/api/private/v1/tool-executions",
		bytes.NewReader(body),
	)
	if err != nil {
		return nil, err
	}
	httpRequest.Header.Set("Authorization", "Bearer "+token)
	httpRequest.Header.Set("Content-Type", "application/json")
	response, err := a.client.Do(httpRequest)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	payload, err := io.ReadAll(io.LimitReader(response.Body, 2<<20))
	if err != nil {
		return nil, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, errors.New("legacy compatibility adapter rejected execution")
	}
	if !json.Valid(payload) {
		return nil, errors.New("legacy compatibility adapter returned invalid JSON")
	}
	return payload, nil
}
