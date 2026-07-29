package main

import (
	"context"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"

	"growx/commandcenter/crm-service/internal/repository"
	"growx/commandcenter/phase4/servicekit"
)

type scopedRequest struct {
	OrganisationID, WorkspaceID, UserID string
	Permissions                         []string
}
type createLeadRequest struct {
	OrganisationID string   `json:"organisationId"`
	WorkspaceID    string   `json:"workspaceId"`
	UserID         string   `json:"userId"`
	Permissions    []string `json:"permissions"`
	BusinessName   string   `json:"businessName"`
	ContactName    string   `json:"contactName"`
	Email          string   `json:"email"`
	City           string   `json:"city"`
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	ctx := context.Background()
	database, err := repository.Open(ctx, servicekit.Required("DATABASE_URL", logger))
	if err != nil {
		logger.Error("database startup failed", "error", err)
		os.Exit(1)
	}
	defer database.Close()
	config := servicekit.Config{ServiceName: "crm-service", Address: servicekit.Required("CRM_SERVICE_ADDRESS", logger), Secret: servicekit.Required("EXECUTION_SERVICE_JWT_SECRET", logger), Environment: servicekit.Required("APP_ENV", logger)}
	mux := http.NewServeMux()
	servicekit.RegisterHealth(mux, database.Ready)
	mux.Handle("GET /internal/v1/crm/leads", servicekit.Authenticate(config, http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		scope, ok := scopeFromQuery(request.URL.Query())
		if !ok || !contains(scope.Permissions, "leads:read") {
			servicekit.WriteError(response, http.StatusForbidden, servicekit.Error(request, "USER_NOT_AUTHORISED", "lead read permission and tenant scope are required", false))
			return
		}
		limit := boundedLimit(request.URL.Query().Get("limit"))
		leads, err := database.SearchLeads(request.Context(), repository.Scope{OrganisationID: scope.OrganisationID, WorkspaceID: scope.WorkspaceID}, request.URL.Query().Get("query"), limit)
		if err != nil {
			servicekit.WriteError(response, http.StatusInternalServerError, servicekit.Error(request, "INTERNAL_FAILURE", "lead search failed", true))
			return
		}
		servicekit.WriteJSON(response, http.StatusOK, map[string]any{"items": leads, "limit": limit})
	})))
	mux.Handle("POST /internal/v1/crm/leads", servicekit.Authenticate(config, http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		var input createLeadRequest
		if servicekit.Decode(response, request, &input) != nil || input.OrganisationID == "" || input.WorkspaceID == "" || strings.TrimSpace(input.BusinessName) == "" || !contains(input.Permissions, "leads:write") {
			servicekit.WriteError(response, http.StatusBadRequest, servicekit.Error(request, "INVALID_INPUT", "valid scoped lead input and write permission are required", false))
			return
		}
		lead, created, err := database.CreateLead(request.Context(), repository.Scope{OrganisationID: input.OrganisationID, WorkspaceID: input.WorkspaceID}, repository.CreateLead{BusinessName: input.BusinessName, ContactName: input.ContactName, Email: input.Email, City: input.City})
		if err != nil {
			servicekit.WriteError(response, http.StatusInternalServerError, servicekit.Error(request, "INTERNAL_FAILURE", "lead creation failed", true))
			return
		}
		status := http.StatusOK
		if created {
			status = http.StatusCreated
		}
		servicekit.WriteJSON(response, status, map[string]any{"lead": lead, "idempotentReplay": !created})
	})))
	servicekit.Run(config, mux, logger)
}
func scopeFromQuery(values url.Values) (scopedRequest, bool) {
	scope := scopedRequest{OrganisationID: values.Get("organisationId"), WorkspaceID: values.Get("workspaceId"), UserID: values.Get("userId"), Permissions: values["permission"]}
	return scope, scope.OrganisationID != "" && scope.WorkspaceID != "" && scope.UserID != ""
}
func boundedLimit(raw string) int {
	value, err := strconv.Atoi(raw)
	if err != nil || value < 1 {
		return 20
	}
	if value > 100 {
		return 100
	}
	return value
}
func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
