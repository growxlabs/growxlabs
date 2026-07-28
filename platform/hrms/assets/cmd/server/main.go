package main

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/hrms/assets/internal/domain"
	"growx/hrms/assets/internal/repository"
	"growx/hrms/assets/internal/service"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type app struct {
	db  *pgxpool.Pool
	svc *service.Service
}

func main() {
	ctx := context.Background()
	db, err := pgxpool.New(ctx, mustEnv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	a := &app{db: db, svc: service.New(repository.New(db))}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.health)
	mux.HandleFunc("GET /assets", a.auth([]string{"assets.view_self", "assets.manage"}, a.list))
	mux.HandleFunc("POST /assets", a.auth([]string{"assets.manage"}, a.create))
	mux.HandleFunc("POST /assets/{id}/receive", a.auth([]string{"assets.manage"}, a.receive))
	mux.HandleFunc("POST /assets/{id}/assign", a.auth([]string{"assets.assign", "assets.manage"}, a.assign))
	mux.HandleFunc("POST /assets/{id}/repairs", a.auth([]string{"assets.manage"}, a.openRepair))
	mux.HandleFunc("POST /repairs/{id}/complete", a.auth([]string{"assets.manage"}, a.completeRepair))
	mux.HandleFunc("POST /assets/{id}/transfer", a.auth([]string{"assets.manage"}, a.transfer))
	mux.HandleFunc("POST /assignments/{id}/accept", a.auth([]string{"assets.view_self"}, a.accept))
	mux.HandleFunc("POST /assignments/{id}/return", a.auth([]string{"assets.return", "assets.manage"}, a.returnAsset))
	mux.HandleFunc("GET /assets/{id}/history", a.auth([]string{"assets.view_self", "assets.manage"}, a.history))
	mux.HandleFunc("POST /requests", a.auth([]string{"assets.request"}, a.requestAsset))
	mux.HandleFunc("POST /requests/on-behalf", a.auth([]string{"assets.assign", "assets.manage"}, a.requestOnBehalf))
	mux.HandleFunc("GET /requests", a.auth([]string{"assets.view_self", "assets.assign", "assets.manage"}, a.requests))
	server := &http.Server{Addr: env("ASSETS_SERVICE_ADDR", ":8085"), Handler: mux, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second}
	log.Fatal(server.ListenAndServe())
}
func (a *app) auth(perms []string, next func(http.ResponseWriter, *http.Request, domain.Actor)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		actor, err := actorFrom(r)
		if err != nil {
			problem(w, 401, err)
			return
		}
		for _, p := range perms {
			if actor.Permissions[p] {
				next(w, r, actor)
				return
			}
		}
		problem(w, 403, errors.New("missing required permission"))
	}
}
func actorFrom(r *http.Request) (domain.Actor, error) {
	a := domain.Actor{UserID: r.Header.Get("X-Actor-Id"), OrganisationID: r.Header.Get("X-Organisation-Id"), RequestID: r.Header.Get("X-Request-Id"), IP: strings.Split(r.Header.Get("X-Forwarded-For"), ",")[0], Permissions: map[string]bool{}}
	if a.UserID == "" || a.OrganisationID == "" || a.RequestID == "" {
		return a, errors.New("actor, organisation and request context are required")
	}
	for _, p := range strings.Split(r.Header.Get("X-Permissions"), ",") {
		a.Permissions[strings.TrimSpace(p)] = true
	}
	return a, nil
}
func (a *app) health(w http.ResponseWriter, r *http.Request) {
	if err := a.db.Ping(r.Context()); err != nil {
		problem(w, 503, err)
		return
	}
	write(w, 200, map[string]string{"status": "ok", "service": "assets"})
}
func (a *app) create(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.CreateAsset
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.Create(r.Context(), actor, in)
	if err != nil {
		problem(w, 422, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) receive(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	if err := a.svc.MakeAvailable(r.Context(), actor, r.PathValue("id")); err != nil {
		problem(w, 409, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) assign(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.AssignAsset
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.Assign(r.Context(), actor, r.PathValue("id"), in)
	if err != nil {
		problem(w, 409, err)
		return
	}
	write(w, 201, map[string]string{"assignmentId": id})
}
func (a *app) openRepair(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.RepairInput
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.OpenRepair(r.Context(), actor, r.PathValue("id"), in)
	if err != nil {
		problem(w, 409, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) completeRepair(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	if err := a.svc.CompleteRepair(r.Context(), actor, r.PathValue("id")); err != nil {
		problem(w, 409, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) transfer(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.TransferInput
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.Transfer(r.Context(), actor, r.PathValue("id"), in)
	if err != nil {
		problem(w, 409, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) accept(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in struct{ Comment string }
	if !decode(w, r, &in) {
		return
	}
	if err := a.svc.Accept(r.Context(), actor, r.PathValue("id"), in.Comment); err != nil {
		problem(w, 409, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) returnAsset(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.ReturnAsset
	if !decode(w, r, &in) {
		return
	}
	if err := a.svc.Return(r.Context(), actor, r.PathValue("id"), in); err != nil {
		problem(w, 409, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) list(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	self := !actor.Permissions["assets.manage"]
	rows, err := a.db.Query(r.Context(), `SELECT DISTINCT a.id,a.asset_code AS "assetCode",a.name,a.state,a.model,a.serial_number AS "serialNumber",a.warranty_expires_at AS "warrantyExpiresAt",x.status AS "assignmentStatus" FROM assets.assets a LEFT JOIN assets.assignments x ON x.asset_id=a.id AND x.status IN('PENDING_ACCEPTANCE','ACTIVE','RETURN_REQUESTED') LEFT JOIN people.employees e ON e.id=x.employee_id WHERE a.organisation_id=$1 AND(NOT $3 OR e.user_id=$2)ORDER BY a.asset_code`, actor.OrganisationID, actor.UserID, self)
	if err != nil {
		problem(w, 422, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) history(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	rows, err := a.db.Query(r.Context(), `SELECT h.id,h.event_type AS "eventType",h.from_state AS "fromState",h.to_state AS "toState",h.actor_user_id AS "actorUserId",h.payload,h.occurred_at AS "occurredAt" FROM assets.history h WHERE h.asset_id=$1 AND h.organisation_id=$2 AND($4 OR EXISTS(SELECT 1 FROM assets.assignments x JOIN people.employees e ON e.id=x.employee_id WHERE x.asset_id=h.asset_id AND e.user_id=$3))ORDER BY h.occurred_at DESC`, r.PathValue("id"), actor.OrganisationID, actor.UserID, actor.Permissions["assets.manage"])
	if err != nil {
		problem(w, 422, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) requestAsset(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.AssetRequest
	if !decode(w, r, &in) {
		return
	}
	var employeeID, id string
	err := a.db.QueryRow(r.Context(), `SELECT id FROM people.employees WHERE organisation_id=$1 AND user_id=$2 AND deleted_at IS NULL`, actor.OrganisationID, actor.UserID).Scan(&employeeID)
	if err != nil {
		problem(w, 422, err)
		return
	}
	err = a.db.QueryRow(r.Context(), `SELECT assets.create_request($1,$2,$3,$4,$5,$6)`, actor.OrganisationID, actor.UserID, employeeID, in.CategoryID, in.Reason, in.Specification).Scan(&id)
	if err != nil {
		problem(w, 422, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) requestOnBehalf(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in struct {
		EmployeeID string
		domain.AssetRequest
	}
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.RequestForEmployee(r.Context(), actor, in.EmployeeID, in.AssetRequest)
	if err != nil {
		problem(w, 422, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) requests(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	manage := actor.Permissions["assets.assign"] || actor.Permissions["assets.manage"]
	rows, err := a.db.Query(r.Context(), `SELECT r.id,r.employee_id AS "employeeId",r.category_id AS "categoryId",r.reason,r.requested_specification AS specification,r.status,r.assigned_asset_id AS "assignedAssetId",r.created_at AS "createdAt" FROM assets.requests r JOIN people.employees e ON e.id=r.employee_id WHERE r.organisation_id=$1 AND($3 OR e.user_id=$2)ORDER BY r.created_at DESC`, actor.OrganisationID, actor.UserID, manage)
	if err != nil {
		problem(w, 422, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func decode(w http.ResponseWriter, r *http.Request, v any) bool {
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 2<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(v); err != nil {
		problem(w, 400, err)
		return false
	}
	return true
}
func write(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func problem(w http.ResponseWriter, status int, err error) {
	write(w, status, map[string]any{"error": http.StatusText(status), "detail": err.Error()})
}
func writeRows(w http.ResponseWriter, rows pgx.Rows) {
	items := []map[string]any{}
	fields := rows.FieldDescriptions()
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			problem(w, 500, err)
			return
		}
		item := map[string]any{}
		for i, field := range fields {
			item[field.Name] = values[i]
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		problem(w, 500, err)
		return
	}
	write(w, 200, map[string]any{"items": items})
}
func env(k, f string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return f
}
func mustEnv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatal(k + " is required")
	}
	return v
}
