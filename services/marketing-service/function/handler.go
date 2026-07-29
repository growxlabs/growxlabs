package function

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"growx/commandcenter/marketing-service/internal/repository"
	"growx/commandcenter/phase4/servicekit"
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

var state struct {
	sync.Mutex
	db *repository.Postgres
}

func Handler(response http.ResponseWriter, request *http.Request) {
	config := servicekit.Config{ServiceName: "marketing-service", Secret: os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), Environment: os.Getenv("APP_ENV")}
	if !servicekit.Authorised(config, request) {
		servicekit.WriteError(response, http.StatusUnauthorized, servicekit.Error(request, "AUTHENTICATION_FAILED", "valid internal gateway identity is required", false))
		return
	}
	db, err := database(request.Context())
	if err != nil {
		servicekit.WriteError(response, 503, servicekit.Error(request, "DOWNSTREAM_UNAVAILABLE", "marketing database is unavailable", true))
		return
	}
	servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.Header.Get("X-GXL-Internal-Path")
		if path == "" {
			path = r.URL.Path
		}
		if r.Method == http.MethodPost && strings.HasSuffix(path, "/publish") {
			servicekit.WriteError(w, 409, servicekit.Error(r, "APPROVAL_REQUIRED", "external publishing requires approval", false))
			return
		}
		if r.Method == http.MethodGet {
			q := r.URL.Query()
			if q.Get("organisationId") == "" || q.Get("workspaceId") == "" || q.Get("userId") == "" || !contains(q["permission"], "marketing:read") {
				servicekit.WriteError(w, 403, servicekit.Error(r, "USER_NOT_AUTHORISED", "campaign permission and tenant scope are required", false))
				return
			}
			items, queryErr := db.Campaigns(r.Context(), q.Get("organisationId"), q.Get("workspaceId"), bounded(q.Get("limit")))
			if queryErr != nil {
				servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "campaigns could not be read", true))
				return
			}
			servicekit.WriteJSON(w, 200, map[string]any{"items": items})
			return
		}
		var input briefRequest
		if r.Method != http.MethodPost || servicekit.Decode(w, r, &input) != nil || input.OrganisationID == "" || input.WorkspaceID == "" || input.UserID == "" || input.IdempotencyKey == "" || strings.TrimSpace(input.Title) == "" || !contains(input.Permissions, "marketing:write") {
			servicekit.WriteError(w, 400, servicekit.Error(r, "INVALID_INPUT", "scoped idempotent content brief input is required", false))
			return
		}
		item, created, createErr := db.CreateBrief(r.Context(), input.OrganisationID, input.WorkspaceID, input.UserID, input.Title, input.Objective, input.Audience, input.IdempotencyKey)
		if createErr != nil {
			servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "content brief could not be created", true))
			return
		}
		status := 200
		if created {
			status = 201
		}
		servicekit.WriteJSON(w, status, map[string]any{"brief": item, "idempotentReplay": !created})
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
