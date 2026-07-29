package main

import (
	"context"
	"growx/commandcenter/finance-service/internal/repository"
	"growx/commandcenter/phase4/servicekit"
	"log/slog"
	"net/http"
	"os"
	"strconv"
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

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	db, err := repository.Open(context.Background(), servicekit.Required("DATABASE_URL", logger))
	if err != nil {
		logger.Error("database startup failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	config := servicekit.Config{ServiceName: "finance-service", Address: servicekit.Required("FINANCE_SERVICE_ADDRESS", logger), Secret: servicekit.Required("EXECUTION_SERVICE_JWT_SECRET", logger), Environment: servicekit.Required("APP_ENV", logger)}
	mux := http.NewServeMux()
	servicekit.RegisterHealth(mux, db.Ready)
	mux.Handle("GET /internal/v1/finance/invoices", servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		if q.Get("organisationId") == "" || q.Get("workspaceId") == "" || q.Get("userId") == "" || !contains(q["permission"], "invoices:read") {
			servicekit.WriteError(w, 403, servicekit.Error(r, "USER_NOT_AUTHORISED", "invoice read scope is required", false))
			return
		}
		limit := 20
		if parsed, e := strconv.Atoi(q.Get("limit")); e == nil && parsed > 0 {
			limit = parsed
		}
		if limit > 100 {
			limit = 100
		}
		items, e := db.List(r.Context(), repository.Scope{OrganisationID: q.Get("organisationId"), WorkspaceID: q.Get("workspaceId")}, limit)
		if e != nil {
			servicekit.WriteError(w, 500, servicekit.Error(r, "INTERNAL_FAILURE", "invoice query failed", true))
			return
		}
		servicekit.WriteJSON(w, 200, map[string]any{"items": items})
	})))
	mux.Handle("POST /internal/v1/finance/invoices/drafts", servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var input requestBody
		if servicekit.Decode(w, r, &input) != nil || input.OrganisationID == "" || input.WorkspaceID == "" || input.IdempotencyKey == "" || !contains(input.Permissions, "invoices:write") {
			servicekit.WriteError(w, 400, servicekit.Error(r, "INVALID_INPUT", "scoped idempotent invoice draft input is required", false))
			return
		}
		item, created, e := db.CreateDraft(r.Context(), repository.Scope{OrganisationID: input.OrganisationID, WorkspaceID: input.WorkspaceID}, input.Amount, input.BalanceDue, input.IdempotencyKey)
		if e != nil {
			servicekit.WriteError(w, 500, servicekit.Error(r, "BUSINESS_RULE_VIOLATION", "invoice draft could not be created", false))
			return
		}
		status := 200
		if created {
			status = 201
		}
		servicekit.WriteJSON(w, status, map[string]any{"invoice": item, "idempotentReplay": !created})
	})))
	mux.Handle("POST /internal/v1/finance/payments", servicekit.Authenticate(config, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		servicekit.WriteError(w, 409, servicekit.Error(r, "APPROVAL_REQUIRED", "payment execution requires Phase 5 approval", false))
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
