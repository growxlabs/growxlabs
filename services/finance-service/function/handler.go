package function

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"growx/commandcenter/finance-service/internal/repository"
	"growx/commandcenter/phase4/servicekit"
)

type requestBody struct {
	OrganisationID string   `json:"organisationId"`
	WorkspaceID    string   `json:"workspaceId"`
	UserID         string   `json:"userId"`
	Permissions    []string `json:"permissions"`
	Amount         string   `json:"amount"`
	BalanceDue     string   `json:"balanceDue"`
	IdempotencyKey string   `json:"idempotencyKey"`
}

var state struct {
	sync.Mutex
	db *repository.Postgres
}

func Handler(response http.ResponseWriter, request *http.Request) {
	config := servicekit.Config{ServiceName: "finance-service", Secret: os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), Environment: os.Getenv("APP_ENV")}
	if !servicekit.Authorised(config, request) {
		servicekit.WriteError(response, http.StatusUnauthorized, servicekit.Error(request, "AUTHENTICATION_FAILED", "valid internal gateway identity is required", false))
		return
	}
	db, err := database(request.Context())
	if err != nil {
		servicekit.WriteError(response, 503, servicekit.Error(request, "DOWNSTREAM_UNAVAILABLE", "finance database is unavailable", true))
		return
	}
	servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.Header.Get("X-GXL-Internal-Path")
		if path == "" {
			path = r.URL.Path
		}
		if r.Method == http.MethodPost && strings.HasSuffix(path, "/payments") {
			servicekit.WriteError(w, 409, servicekit.Error(r, "APPROVAL_REQUIRED", "payment execution requires approval", false))
			return
		}
		if r.Method == http.MethodGet {
			q := r.URL.Query()
			if q.Get("organisationId") == "" || q.Get("workspaceId") == "" || q.Get("userId") == "" || !contains(q["permission"], "invoices:read") {
				servicekit.WriteError(w, 403, servicekit.Error(r, "USER_NOT_AUTHORISED", "invoice read scope is required", false))
				return
			}
			items, queryErr := db.List(r.Context(), repository.Scope{OrganisationID: q.Get("organisationId"), WorkspaceID: q.Get("workspaceId")}, bounded(q.Get("limit")))
			if queryErr != nil {
				servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "invoice query failed", true))
				return
			}
			servicekit.WriteJSON(w, 200, map[string]any{"items": items})
			return
		}
		var input requestBody
		if r.Method != http.MethodPost || servicekit.Decode(w, r, &input) != nil || input.OrganisationID == "" || input.WorkspaceID == "" || input.IdempotencyKey == "" || !contains(input.Permissions, "invoices:write") {
			servicekit.WriteError(w, 400, servicekit.Error(r, "INVALID_INPUT", "scoped idempotent invoice draft input is required", false))
			return
		}
		item, created, createErr := db.CreateDraft(r.Context(), repository.Scope{OrganisationID: input.OrganisationID, WorkspaceID: input.WorkspaceID}, input.Amount, input.BalanceDue, input.IdempotencyKey)
		if createErr != nil {
			servicekit.WriteError(w, 422, servicekit.Error(r, "BUSINESS_RULE_VIOLATION", "invoice draft could not be created", false))
			return
		}
		status := 200
		if created {
			status = 201
		}
		servicekit.WriteJSON(w, status, map[string]any{"invoice": item, "idempotentReplay": !created})
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
