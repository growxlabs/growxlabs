package function

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"growx/commandcenter/crm-service/internal/repository"
	"growx/commandcenter/phase4/servicekit"
)

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

var state struct {
	sync.Mutex
	db *repository.Postgres
}

func Handler(response http.ResponseWriter, request *http.Request) {
	config := servicekit.Config{ServiceName: "crm-service", Secret: os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), Environment: os.Getenv("APP_ENV")}
	if !servicekit.Authorised(config, request) {
		servicekit.WriteError(response, http.StatusUnauthorized, servicekit.Error(request, "AUTHENTICATION_FAILED", "valid internal gateway identity is required", false))
		return
	}
	db, err := database(request.Context())
	if err != nil {
		servicekit.WriteError(response, 503, servicekit.Error(request, "DOWNSTREAM_UNAVAILABLE", "CRM database is unavailable", true))
		return
	}
	servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			q := r.URL.Query()
			if q.Get("organisationId") == "" || q.Get("workspaceId") == "" || q.Get("userId") == "" || !contains(q["permission"], "leads:read") {
				servicekit.WriteError(w, 403, servicekit.Error(r, "USER_NOT_AUTHORISED", "lead read permission and tenant scope are required", false))
				return
			}
			limit := bounded(q.Get("limit"))
			items, queryErr := db.SearchLeads(r.Context(), repository.Scope{OrganisationID: q.Get("organisationId"), WorkspaceID: q.Get("workspaceId")}, q.Get("query"), limit)
			if queryErr != nil {
				servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "lead search failed", true))
				return
			}
			servicekit.WriteJSON(w, 200, map[string]any{"items": items, "limit": limit})
			return
		}
		var input createLeadRequest
		if r.Method != http.MethodPost || servicekit.Decode(w, r, &input) != nil || input.OrganisationID == "" || input.WorkspaceID == "" || input.UserID == "" || strings.TrimSpace(input.BusinessName) == "" || !contains(input.Permissions, "leads:write") {
			servicekit.WriteError(w, 400, servicekit.Error(r, "INVALID_INPUT", "valid scoped lead input and write permission are required", false))
			return
		}
		item, created, createErr := db.CreateLead(r.Context(), repository.Scope{OrganisationID: input.OrganisationID, WorkspaceID: input.WorkspaceID}, repository.CreateLead{BusinessName: input.BusinessName, ContactName: input.ContactName, Email: input.Email, City: input.City})
		if createErr != nil {
			servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "lead creation failed", true))
			return
		}
		status := 200
		if created {
			status = 201
		}
		servicekit.WriteJSON(w, status, map[string]any{"lead": item, "idempotentReplay": !created})
	})).ServeHTTP(response, request)
}
func database(ctx context.Context) (*repository.Postgres, error) {
	state.Lock()
	defer state.Unlock()
	if state.db != nil && state.db.Ready(ctx) == nil {
		return state.db, nil
	}
	startup, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	db, err := repository.Open(startup, os.Getenv("DATABASE_URL"))
	if err == nil {
		state.db = db
	}
	return db, err
}
func bounded(raw string) int {
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
