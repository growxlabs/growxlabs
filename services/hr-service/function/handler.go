package function

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"growx/commandcenter/hr-service/internal/repository"
	"growx/commandcenter/phase4/servicekit"
)

var state struct {
	sync.Mutex
	db *repository.Postgres
}

func Handler(response http.ResponseWriter, request *http.Request) {
	config := servicekit.Config{ServiceName: "hr-service", Secret: os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), Environment: os.Getenv("APP_ENV")}
	if !servicekit.Authorised(config, request) {
		servicekit.WriteError(response, http.StatusUnauthorized, servicekit.Error(request, "AUTHENTICATION_FAILED", "valid internal gateway identity is required", false))
		return
	}
	db, err := database(request.Context())
	if err != nil {
		servicekit.WriteError(response, http.StatusServiceUnavailable, servicekit.Error(request, "DOWNSTREAM_UNAVAILABLE", "HR database is unavailable", true))
		return
	}
	servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.Header.Get("X-GXL-Internal-Path")
		if path == "" {
			path = r.URL.Path
		}
		if r.Method == http.MethodPost && strings.HasSuffix(path, "/termination") {
			servicekit.WriteError(w, http.StatusConflict, servicekit.Error(r, "APPROVAL_REQUIRED", "employee termination requires approval", false))
			return
		}
		q := r.URL.Query()
		if r.Method != http.MethodGet || q.Get("organisationId") == "" || q.Get("workspaceId") == "" || q.Get("userId") == "" ||
			(!contains(q["permission"], "employees:read") && !contains(q["permission"], "people.employee.read")) {
			servicekit.WriteError(w, http.StatusForbidden, servicekit.Error(r, "USER_NOT_AUTHORISED", "employee permission and tenant scope are required", false))
			return
		}
		limit := bounded(q.Get("limit"))
		items, queryErr := db.ListEmployees(r.Context(), q.Get("organisationId"), q.Get("workspaceId"), limit)
		if queryErr != nil {
			servicekit.WriteError(w, http.StatusInternalServerError, servicekit.Error(r, "INTERNAL_FAILURE", "employee summaries could not be read", true))
			return
		}
		servicekit.WriteJSON(w, http.StatusOK, map[string]any{"items": items, "limit": limit})
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
