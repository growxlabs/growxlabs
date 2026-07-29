package function

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	serviceauth "growx/commandcenter/execution/auth"
	governance "growx/commandcenter/governance-service/function"
)

type target struct{ prefix, audience, environment string }

var targets = []target{
	{"/internal/v1/tools", "tool-service", "TOOL_SERVICE_INTERNAL_URL"},
	{"/internal/v1/tool-executions", "tool-service", "TOOL_SERVICE_INTERNAL_URL"},
	{"/internal/v1/capabilities", "capability-service", "CAPABILITY_SERVICE_INTERNAL_URL"},
	{"/internal/v1/skills", "skill-service", "SKILL_SERVICE_INTERNAL_URL"},
	{"/internal/v1/crm", "crm-service", "CRM_SERVICE_INTERNAL_URL"},
	{"/internal/v1/finance", "finance-service", "FINANCE_SERVICE_INTERNAL_URL"},
	{"/internal/v1/hr", "hr-service", "HR_SERVICE_INTERNAL_URL"},
	{"/internal/v1/projects", "project-service", "PROJECT_SERVICE_INTERNAL_URL"},
	{"/internal/v1/marketing", "marketing-service", "MARKETING_SERVICE_INTERNAL_URL"},
}

func Handler(response http.ResponseWriter, request *http.Request) {
	path := request.Header.Get("X-GXL-Internal-Path")
	if path == "" {
		path = strings.TrimPrefix(request.URL.Path, "/api/private/gateway")
	}
	if path == "/health" {
		writeJSON(response, http.StatusOK, map[string]string{"status": "ok"})
		return
	}
	identity, ok := authenticate(request)
	if !ok {
		writeError(response, http.StatusUnauthorized, "AUTHENTICATION_FAILED", "valid internal service identity is required")
		return
	}
	if strings.HasPrefix(path, "/internal/v1/governance/") {
		governance.Handler(response, request)
		return
	}
	var selected *target
	for index := range targets {
		if strings.HasPrefix(path, targets[index].prefix) {
			selected = &targets[index]
			break
		}
	}
	if selected == nil {
		writeError(response, http.StatusNotFound, "ROUTE_NOT_FOUND", "internal route is unavailable")
		return
	}
	body, err := io.ReadAll(http.MaxBytesReader(response, request.Body, 1<<20))
	if err != nil {
		writeError(response, http.StatusRequestEntityTooLarge, "INVALID_INPUT", "payload exceeds gateway policy")
		return
	}
	baseURL := strings.TrimRight(os.Getenv(selected.environment), "/")
	if baseURL == "" {
		writeError(response, http.StatusServiceUnavailable, "DOWNSTREAM_UNAVAILABLE", "internal service route is not configured")
		return
	}
	targetURL, err := url.Parse(baseURL)
	if err != nil {
		writeError(response, http.StatusInternalServerError, "INTERNAL_FAILURE", "downstream route is invalid")
		return
	}
	proxyRequest, err := http.NewRequestWithContext(request.Context(), request.Method, targetURL.String(), bytes.NewReader(body))
	if err != nil {
		writeError(response, http.StatusInternalServerError, "INTERNAL_FAILURE", "downstream request could not be created")
		return
	}
	requestID := request.Header.Get("X-Request-ID")
	now := time.Now()
	token, err := serviceauth.Sign(serviceauth.Claims{
		Issuer: "internal-api-gateway", Audience: selected.audience, Service: "internal-api-gateway",
		Env: os.Getenv("APP_ENV"), RequestID: requestID, IssuedAt: now.Unix(), ExpiresAt: now.Add(time.Minute).Unix(),
	}, os.Getenv("EXECUTION_SERVICE_JWT_SECRET"))
	if err != nil {
		writeError(response, http.StatusInternalServerError, "INTERNAL_FAILURE", "service authentication failed")
		return
	}
	proxyRequest.Header.Set("Authorization", "Bearer "+token)
	proxyRequest.Header.Set("Content-Type", "application/json")
	proxyRequest.Header.Set("X-Request-ID", requestID)
	proxyRequest.Header.Set("X-Service-Name", identity)
	proxyRequest.Header.Set("Traceparent", request.Header.Get("Traceparent"))
	proxyRequest.Header.Set("X-GXL-Internal-Path", path)
	result, err := (&http.Client{Timeout: 45 * time.Second}).Do(proxyRequest)
	if err != nil {
		writeError(response, http.StatusBadGateway, "DOWNSTREAM_UNAVAILABLE", "internal service is unavailable")
		return
	}
	defer result.Body.Close()
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(result.StatusCode)
	_, _ = io.Copy(response, io.LimitReader(result.Body, 2<<20))
}

func authenticate(request *http.Request) (string, bool) {
	token := strings.TrimPrefix(request.Header.Get("Authorization"), "Bearer ")
	for _, identity := range []string{"gxl-web", "execution-worker", "tool-service"} {
		claims, err := serviceauth.Verify(token, os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), identity, "internal-api-gateway", os.Getenv("APP_ENV"), time.Now())
		if err == nil && claims.Service == identity {
			return identity, true
		}
	}
	return "", false
}
func writeError(response http.ResponseWriter, status int, code, message string) {
	writeJSON(response, status, map[string]any{"error": map[string]any{"code": code, "message": message, "retryable": status >= 500}})
}
func writeJSON(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(value)
}
