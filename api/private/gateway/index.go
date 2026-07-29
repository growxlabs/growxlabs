package handler

import (
	"net/http"
	"strings"

	capability "growx/commandcenter/capability-service/function"
	crm "growx/commandcenter/crm-service/function"
	execution "growx/commandcenter/execution-engine/function"
	worker "growx/commandcenter/execution-worker/function"
	finance "growx/commandcenter/finance-service/function"
	governance "growx/commandcenter/governance-service/function"
	hr "growx/commandcenter/hr-service/function"
	gateway "growx/commandcenter/internal-api-gateway/function"
	marketing "growx/commandcenter/marketing-service/function"
	project "growx/commandcenter/project-service/function"
	skill "growx/commandcenter/skill-service/function"
	scheduler "growx/commandcenter/task-scheduler/function"
	tool "growx/commandcenter/tool-service/function"
)

// Handler is the consolidated single deployable Go entrypoint for Vercel.
func Handler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	internalPath := r.Header.Get("X-GXL-Internal-Path")

	switch {
	case strings.HasPrefix(path, "/api/private/gateway/capabilities") || strings.HasPrefix(path, "/api/private/capabilities") || strings.HasPrefix(internalPath, "/internal/v1/capabilities"):
		capability.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/crm") || strings.HasPrefix(path, "/api/private/crm") || strings.HasPrefix(internalPath, "/internal/v1/crm"):
		crm.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/execution") || strings.HasPrefix(path, "/api/private/execution"):
		execution.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/finance") || strings.HasPrefix(path, "/api/private/finance") || strings.HasPrefix(internalPath, "/internal/v1/finance"):
		finance.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/hr") || strings.HasPrefix(path, "/api/private/hr") || strings.HasPrefix(internalPath, "/internal/v1/hr"):
		hr.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/marketing") || strings.HasPrefix(path, "/api/private/marketing") || strings.HasPrefix(internalPath, "/internal/v1/marketing"):
		marketing.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/projects") || strings.HasPrefix(path, "/api/private/projects") || strings.HasPrefix(internalPath, "/internal/v1/projects"):
		project.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/scheduler") || strings.HasPrefix(path, "/api/private/scheduler"):
		scheduler.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/skills") || strings.HasPrefix(path, "/api/private/skills") || strings.HasPrefix(internalPath, "/internal/v1/skills"):
		skill.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/tools") || strings.HasPrefix(path, "/api/private/tools") || strings.HasPrefix(internalPath, "/internal/v1/tools") || strings.HasPrefix(internalPath, "/internal/v1/tool-executions"):
		tool.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/worker") || strings.HasPrefix(path, "/api/private/worker"):
		worker.Handler(w, r)
	case strings.HasPrefix(path, "/api/private/gateway/governance") || strings.HasPrefix(path, "/api/private/governance") || strings.HasPrefix(internalPath, "/internal/v1/governance"):
		governance.Handler(w, r)
	default:
		gateway.Handler(w, r)
	}
}
