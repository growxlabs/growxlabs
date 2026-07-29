package main

import (
	"context"
	"growx/commandcenter/hr-service/internal/repository"
	"growx/commandcenter/phase4/servicekit"
	"log/slog"
	"net/http"
	"os"
	"strconv"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	db, err := repository.Open(context.Background(), servicekit.Required("DATABASE_URL", logger))
	if err != nil {
		logger.Error("database startup failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	config := servicekit.Config{ServiceName: "hr-service", Address: servicekit.Required("HR_SERVICE_ADDRESS", logger), Secret: servicekit.Required("EXECUTION_SERVICE_JWT_SECRET", logger), Environment: servicekit.Required("APP_ENV", logger)}
	mux := http.NewServeMux()
	servicekit.RegisterHealth(mux, db.Ready)
	mux.Handle("GET /internal/v1/hr/employees", servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if q.Get("organisationId") == "" || q.Get("userId") == "" || (!contains(q["permission"], "employees:read") && !contains(q["permission"], "people.employee.read")) {
			servicekit.WriteError(w, 403, servicekit.Error(r, "USER_NOT_AUTHORISED", "employee summary permission and organisation scope are required", false))
			return
		}
		limit := 20
		if value, e := strconv.Atoi(q.Get("limit")); e == nil && value > 0 {
			limit = value
		}
		if limit > 100 {
			limit = 100
		}
		items, e := db.ListEmployees(r.Context(), q.Get("organisationId"), q.Get("workspaceId"), limit)
		if e != nil {
			servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "employee summaries could not be read", true))
			return
		}
		servicekit.WriteJSON(w, 200, map[string]any{"items": items})
	})))
	mux.Handle("POST /internal/v1/hr/termination", servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		servicekit.WriteError(w, 409, servicekit.Error(r, "APPROVAL_REQUIRED", "employee termination requires Phase 5 approval", false))
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
