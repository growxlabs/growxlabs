package function

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
	"growx/commandcenter/phase4/catalog"
	"growx/commandcenter/phase4/contract"
	"growx/commandcenter/phase4/registry"
)

type resolutionRequest struct {
	CapabilityID string         `json:"capabilityId"`
	Version      string         `json:"version"`
	AgentID      string         `json:"agentId"`
	SkillID      string         `json:"skillId,omitempty"`
	ToolID       string         `json:"toolId,omitempty"`
	Scope        contract.Scope `json:"scope"`
}

var state struct {
	sync.Once
	registry *registry.Registry[registry.Capability]
	err      error
}

func Handler(response http.ResponseWriter, request *http.Request) {
	path := request.Header.Get("X-GXL-Internal-Path")
	if path == "" {
		path = request.URL.Path
	}
	if request.Method != http.MethodPost || !strings.HasSuffix(path, "/resolve") {
		writeError(response, http.StatusNotFound, "ROUTE_NOT_FOUND", "capability route is unavailable")
		return
	}
	if !authorised(request) {
		writeError(response, http.StatusUnauthorized, "AUTHENTICATION_FAILED", "valid internal gateway identity is required")
		return
	}
	state.Do(func() { state.registry, state.err = catalog.CapabilityRegistry() })
	if state.err != nil {
		writeError(response, http.StatusInternalServerError, "INTERNAL_FAILURE", "capability registry is unavailable")
		return
	}
	var input resolutionRequest
	decoder := json.NewDecoder(http.MaxBytesReader(response, request.Body, 256<<10))
	decoder.DisallowUnknownFields()
	if decoder.Decode(&input) != nil {
		writeError(response, http.StatusBadRequest, "INVALID_INPUT", "invalid capability resolution request")
		return
	}
	entry, err := state.registry.Get(input.CapabilityID, input.Version, false)
	if err != nil {
		writeError(response, http.StatusNotFound, "CAPABILITY_UNAVAILABLE", "capability is unavailable")
		return
	}
	definition := entry.Contract()
	if !contains(definition.AllowedAgentIDs, input.AgentID) ||
		(input.SkillID != "" && !contains(definition.AllowedSkillIDs, input.SkillID)) ||
		(input.ToolID != "" && !contains(definition.AllowedToolIDs, input.ToolID)) ||
		input.Scope.OrganisationID == "" || input.Scope.WorkspaceID == "" || input.Scope.UserID == "" ||
		(len(definition.OrganisationScope) > 0 && !contains(definition.OrganisationScope, input.Scope.OrganisationID)) ||
		(len(definition.WorkspaceScope) > 0 && !contains(definition.WorkspaceScope, input.Scope.WorkspaceID)) {
		writeError(response, http.StatusForbidden, "CAPABILITY_FORBIDDEN", "capability constraints were not satisfied")
		return
	}
	for _, permission := range definition.RequiredPermissions {
		if !contains(input.Scope.Permissions, permission) {
			writeError(response, http.StatusForbidden, "USER_NOT_AUTHORISED", "required capability permission is unavailable")
			return
		}
	}
	writeJSON(response, http.StatusOK, map[string]any{"allowed": true, "definition": definition, "reason": "capability constraints are authorised"})
}

func authorised(request *http.Request) bool {
	token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
	claims, err := serviceauth.Verify(token, os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), "internal-api-gateway", "capability-service", os.Getenv("APP_ENV"), time.Now())
	return err == nil && claims.Service == "internal-api-gateway"
}
func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
func writeError(response http.ResponseWriter, status int, code, message string) {
	writeJSON(response, status, map[string]any{"error": map[string]any{"code": code, "message": message, "retryable": false}})
}
func writeJSON(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(value)
}
