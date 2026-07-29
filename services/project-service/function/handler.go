package function

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"growx/commandcenter/phase4/servicekit"
	"growx/commandcenter/project-service/internal/repository"
)

var state struct {
	sync.Mutex
	db *repository.Postgres
}

func Handler(response http.ResponseWriter, request *http.Request) {
	config := servicekit.Config{ServiceName: "project-service", Secret: os.Getenv("EXECUTION_SERVICE_JWT_SECRET"), Environment: os.Getenv("APP_ENV")}
	if !servicekit.Authorised(config, request) {
		servicekit.WriteError(response, http.StatusUnauthorized, servicekit.Error(request, "AUTHENTICATION_FAILED", "valid internal gateway identity is required", false))
		return
	}
	db, err := database(request.Context())
	if err != nil {
		servicekit.WriteError(response, http.StatusServiceUnavailable, servicekit.Error(request, "DOWNSTREAM_UNAVAILABLE", "project database is unavailable", true))
		return
	}
	servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if r.Method != http.MethodGet || q.Get("organisationId") == "" || q.Get("workspaceId") == "" || q.Get("userId") == "" || !contains(q["permission"], "projects:read") {
			servicekit.WriteError(w, http.StatusForbidden, servicekit.Error(r, "USER_NOT_AUTHORISED", "project permission and tenant scope are required", false))
			return
		}
		limit := bounded(q.Get("limit"))
		items, queryErr := db.List(r.Context(), q.Get("organisationId"), q.Get("workspaceId"), limit)
		if queryErr != nil {
			servicekit.WriteError(w, http.StatusInternalServerError, servicekit.Error(r, "INTERNAL_FAILURE", "projects could not be read", true))
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
