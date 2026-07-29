package main

import (
	"context"
	"growx/commandcenter/marketing-service/internal/repository"
	"growx/commandcenter/phase4/servicekit"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"strings"
)

type briefRequest struct {
	OrganisationID string   `json:"organisationId"`
	WorkspaceID    string   `json:"workspaceId"`
	UserID         string   `json:"userId"`
	Permissions    []string `json:"permissions"`
	Title          string   `json:"title"`
	Objective      string   `json:"objective"`
	Audience       string   `json:"audience"`
	IdempotencyKey string   `json:"idempotencyKey"`
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	db, err := repository.Open(context.Background(), servicekit.Required("DATABASE_URL", logger))
	if err != nil {
		logger.Error("database startup failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	config := servicekit.Config{ServiceName: "marketing-service", Address: servicekit.Required("MARKETING_SERVICE_ADDRESS", logger), Secret: servicekit.Required("EXECUTION_SERVICE_JWT_SECRET", logger), Environment: servicekit.Required("APP_ENV", logger)}
	mux := http.NewServeMux()
	servicekit.RegisterHealth(mux, db.Ready)
	mux.Handle("GET /internal/v1/marketing/campaigns", servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if q.Get("organisationId") == "" || q.Get("workspaceId") == "" || q.Get("userId") == "" || !contains(q["permission"], "marketing:read") {
			servicekit.WriteError(w, 403, servicekit.Error(r, "USER_NOT_AUTHORISED", "campaign permission and tenant scope are required", false))
			return
		}
		limit := 20
		if value, e := strconv.Atoi(q.Get("limit")); e == nil && value > 0 {
			limit = value
		}
		if limit > 100 {
			limit = 100
		}
		items, e := db.Campaigns(r.Context(), q.Get("organisationId"), q.Get("workspaceId"), limit)
		if e != nil {
			servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "campaigns could not be read", true))
			return
		}
		servicekit.WriteJSON(w, 200, map[string]any{"items": items})
	})))
	mux.Handle("POST /internal/v1/marketing/content-briefs", servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var input briefRequest
		if servicekit.Decode(w, r, &input) != nil || input.OrganisationID == "" || input.WorkspaceID == "" || input.UserID == "" || input.IdempotencyKey == "" || strings.TrimSpace(input.Title) == "" || !contains(input.Permissions, "marketing:write") {
			servicekit.WriteError(w, 400, servicekit.Error(r, "INVALID_INPUT", "scoped idempotent content brief input is required", false))
			return
		}
		item, created, e := db.CreateBrief(r.Context(), input.OrganisationID, input.WorkspaceID, input.UserID, input.Title, input.Objective, input.Audience, input.IdempotencyKey)
		if e != nil {
			servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "content brief could not be created", true))
			return
		}
		status := 200
		if created {
			status = 201
		}
		servicekit.WriteJSON(w, status, map[string]any{"brief": item, "idempotentReplay": !created})
	})))
	mux.Handle("POST /internal/v1/marketing/publish", servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		servicekit.WriteError(w, 409, servicekit.Error(r, "APPROVAL_REQUIRED", "external publishing requires Phase 5 approval", false))
	})))
	servicekit.Run(config, mux, logger)
}
func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
