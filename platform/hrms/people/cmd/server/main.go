package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type app struct {
	db      *pgxpool.Pool
	storage StorageProvider
}
type actor struct {
	UserID, OrganisationID, RequestID, IP string
	Permissions                           map[string]bool
}
type employeeInput struct {
	EmployeeNumber   string  `json:"employeeNumber"`
	FirstName        string  `json:"firstName"`
	MiddleName       *string `json:"middleName"`
	LastName         string  `json:"lastName"`
	PreferredName    *string `json:"preferredName"`
	UserID           *string `json:"userId"`
	BusinessUnitID   *string `json:"businessUnitId"`
	LegalEntityID    *string `json:"legalEntityId"`
	JoiningDate      string  `json:"joiningDate"`
	EmploymentType   string  `json:"employmentType"`
	DepartmentID     *string `json:"departmentId"`
	DesignationID    *string `json:"designationId"`
	ManagerID        *string `json:"managerEmployeeId"`
	WorkLocation     *string `json:"workLocation"`
	EmploymentStatus string  `json:"status"`
}
type departmentInput struct {
	Name, Code               string
	Description              *string `json:"description"`
	ParentID, HeadEmployeeID *string
	AnnualBudget             *float64
	Status                   string
}
type designationInput struct {
	Name, Code                   string
	DepartmentID, ParentID       *string
	Level                        *int
	SalaryBandMin, SalaryBandMax *float64
	Status                       string
}

func main() {
	ctx := context.Background()
	db, err := pgxpool.New(ctx, mustEnv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err := db.Ping(ctx); err != nil {
		log.Fatalf("database unavailable: %v", err)
	}

	storage, err := NewSupabaseStorageProviderFromEnv()
	if err != nil {
		log.Fatalf("storage configuration invalid: %v", err)
	}
	a := &app{db: db, storage: storage}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("GET /ready", a.health)
	mux.HandleFunc("GET /healthz", a.health)
	mux.HandleFunc("GET /organisations", a.authorize("organisation.manage", a.listOrganisations))
	mux.HandleFunc("POST /organisations", a.authorize("organisation.manage", a.createOrganisation))
	mux.HandleFunc("GET /employees", a.authorize("employee.view", a.listEmployees))
	mux.HandleFunc("POST /employees", a.authorize("employee.edit", a.createEmployee))
	mux.HandleFunc("GET /employees/{id}", a.authorize("employee.view", a.getEmployee))
	mux.HandleFunc("PATCH /employees/{id}", a.authorize("employee.edit", a.updateEmployment))
	mux.HandleFunc("DELETE /employees/{id}", a.authorize("employee.edit", a.deleteEmployee))
	mux.HandleFunc("GET /employees/{id}/history", a.authorize("employee.view", a.employeeHistory))
	mux.HandleFunc("GET /employees/{id}/audit", a.authorize("employee.view", a.employeeAudit))
	mux.HandleFunc("GET /me", a.authorize("employee.view", a.selfProfile))
	mux.HandleFunc("PATCH /me/contacts", a.authorize("employee.edit_self", a.updateSelfContacts))
	mux.HandleFunc("GET /me/team", a.authorize("manager.view_team", a.team))
	mux.HandleFunc("GET /departments", a.authorize("employee.view", a.listDepartments))
	mux.HandleFunc("POST /departments", a.authorize("department.manage", a.createDepartment))
	mux.HandleFunc("GET /departments/{id}", a.authorize("employee.view", a.getDepartment))
	mux.HandleFunc("PATCH /departments/{id}", a.authorize("department.manage", a.updateDepartment))
	mux.HandleFunc("PATCH /departments/{id}/status", a.authorize("department.manage", a.updateDepartmentStatus))
	mux.HandleFunc("DELETE /departments/{id}", a.authorize("department.manage", a.deleteDepartment))
	mux.HandleFunc("GET /designations", a.authorize("employee.view", a.listDesignations))
	mux.HandleFunc("POST /designations", a.authorize("designation.manage", a.createDesignation))
	mux.HandleFunc("GET /designations/{id}", a.authorize("employee.view", a.getDesignation))
	mux.HandleFunc("PATCH /designations/{id}", a.authorize("designation.manage", a.updateDesignation))
	mux.HandleFunc("PATCH /designations/{id}/status", a.authorize("designation.manage", a.updateDesignationStatus))
	mux.HandleFunc("DELETE /designations/{id}", a.authorize("designation.manage", a.deleteDesignation))
	mux.HandleFunc("POST /documents/upload-url", a.authorizeAny([]string{"documents.upload_self", "documents.manage", "employee.edit"}, a.createDocumentUpload))
	mux.HandleFunc("GET /documents", a.authorizeAny([]string{"documents.view_self", "documents.manage", "employee.view"}, a.listDocuments))
	mux.HandleFunc("GET /documents/categories", a.authorizeAny([]string{"documents.view_self", "documents.manage"}, a.listDocumentCategories))
	mux.HandleFunc("POST /documents/categories", a.authorize("documents.manage", a.createDocumentCategory))
	mux.HandleFunc("GET /documents/requests", a.authorizeAny([]string{"documents.view_self", "documents.verify", "documents.request", "documents.manage"}, a.listDocumentRequests))
	mux.HandleFunc("POST /documents/requests", a.authorizeAny([]string{"documents.request", "documents.manage"}, a.createDocumentRequest))
	mux.HandleFunc("POST /documents/requests/{id}/submit", a.authorizeAny([]string{"documents.upload_self", "documents.manage"}, a.submitDocumentRequest))
	mux.HandleFunc("POST /documents/requests/{id}/verify", a.authorizeAny([]string{"documents.verify", "documents.manage"}, a.verifyDocumentRequest))
	mux.HandleFunc("GET /documents/{id}", a.authorizeAny([]string{"documents.view_self", "documents.manage", "employee.view"}, a.getDocument))
	mux.HandleFunc("POST /documents/{id}/download-url", a.authorizeAny([]string{"documents.view_self", "documents.manage", "employee.view"}, a.createDocumentDownload))
	mux.HandleFunc("POST /documents/{id}/versions/upload-url", a.authorizeAny([]string{"documents.upload_self", "documents.manage", "employee.edit"}, a.createDocumentVersionUpload))
	mux.HandleFunc("POST /documents/{id}/versions/{versionId}/download-url", a.authorizeAny([]string{"documents.view_self", "documents.manage"}, a.createDocumentVersionDownload))
	mux.HandleFunc("POST /documents/{id}/versions/{versionId}/restore", a.authorize("documents.manage", a.restoreDocumentVersion))
	mux.HandleFunc("POST /documents/{id}/uploads/{versionId}/complete", a.authorizeAny([]string{"documents.upload_self", "documents.manage"}, a.completeDocumentUpload))
	mux.HandleFunc("POST /documents/{id}/acknowledge", a.authorizeAny([]string{"documents.view_self", "documents.manage"}, a.acknowledgeDocument))
	mux.HandleFunc("DELETE /documents/{id}", a.authorizeAny([]string{"documents.manage", "employee.edit"}, a.deleteDocument))
	mux.HandleFunc("POST /workflows/definitions", a.authorize("organisation.manage", a.createWorkflowDefinition))
	mux.HandleFunc("POST /workflows/instances/{id}/transition", a.authorize("organisation.manage", a.transitionWorkflow))
	mux.HandleFunc("POST /workflows/instances/{id}/tasks", a.authorize("organisation.manage", a.createWorkflowTask))
	mux.HandleFunc("POST /workflows/tasks/{id}/complete", a.authorize("organisation.manage", a.completeWorkflowTask))
	mux.HandleFunc("POST /workflows/instances", a.authorize("organisation.manage", a.startWorkflow))
	mux.HandleFunc("POST /notifications", a.authorize("organisation.manage", a.enqueueNotification))
	mux.HandleFunc("GET /notifications/me", a.authorize("employee.view", a.listMyNotifications))
	mux.HandleFunc("POST /notifications/{id}/read", a.authorize("employee.view", a.readNotification))
	addr := env("PEOPLE_SERVICE_ADDR", ":8081")
	server := &http.Server{Addr: addr, Handler: middleware(mux), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second}
	log.Printf("people service listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}

func (a *app) health(w http.ResponseWriter, r *http.Request) {
	if err := a.db.Ping(r.Context()); err != nil {
		problem(w, 503, "database_unavailable", err.Error())
		return
	}
	writeJSON(w, 200, map[string]string{"status": "ok", "service": "people"})
}

func (a *app) authorize(permission string, next func(http.ResponseWriter, *http.Request, actor)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ac, err := actorFrom(r)
		if err != nil {
			problem(w, 401, "unauthenticated", err.Error())
			return
		}
		if !ac.Permissions[permission] {
			problem(w, 403, "forbidden", "missing permission: "+permission)
			return
		}
		next(w, r, ac)
	}
}
func (a *app) authorizeAny(permissions []string, next func(http.ResponseWriter, *http.Request, actor)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ac, err := actorFrom(r)
		if err != nil {
			problem(w, 401, "unauthenticated", err.Error())
			return
		}
		for _, permission := range permissions {
			if ac.Permissions[permission] {
				next(w, r, ac)
				return
			}
		}
		problem(w, 403, "forbidden", "missing required permission")
	}
}

func (a *app) listOrganisations(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT id,name,slug,timezone,currency,version FROM people.organisations WHERE id=$1 AND deleted_at IS NULL`, ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) createOrganisation(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ Name, Slug, Timezone, Currency string }
	if !decode(w, r, &in) {
		return
	}
	if strings.TrimSpace(in.Name) == "" || strings.TrimSpace(in.Slug) == "" {
		problem(w, 422, "validation_error", "name and slug are required")
		return
	}
	if in.Timezone == "" {
		in.Timezone = "Asia/Kolkata"
	}
	if in.Currency == "" {
		in.Currency = "INR"
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO people.organisations(id,name,slug,timezone,currency) VALUES($1,$2,$3,$4,$5) RETURNING id`, ac.OrganisationID, in.Name, in.Slug, in.Timezone, in.Currency).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "organisation", id, "organisation.created", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}

func (a *app) listEmployees(w http.ResponseWriter, r *http.Request, ac actor) {
	q := "%" + strings.TrimSpace(r.URL.Query().Get("q")) + "%"
	page := positiveInt(r.URL.Query().Get("page"), 1, 1, 100000)
	size := positiveInt(r.URL.Query().Get("pageSize"), 20, 1, 100)
	dept := r.URL.Query().Get("departmentId")
	if dept == "" {
		dept = r.URL.Query().Get("department")
	}
	designation, manager, status, employmentType, location := r.URL.Query().Get("designationId"), r.URL.Query().Get("managerEmployeeId"), r.URL.Query().Get("status"), r.URL.Query().Get("employmentType"), r.URL.Query().Get("workLocation")
	const filter = ` e.organisation_id=$1 AND e.deleted_at IS NULL AND
		($2='%%' OR concat_ws(' ',e.first_name,e.middle_name,e.last_name) ILIKE $2 OR e.employee_number ILIKE $2 OR c.value ILIKE $2) AND
		($3='' OR er.department_id::text=$3 OR d.name=$3) AND ($4='' OR er.designation_id::text=$4) AND
		($5='' OR er.manager_employee_id::text=$5) AND ($6='' OR er.status::text=$6) AND
		($7='' OR er.employment_type=$7) AND ($8='' OR er.work_location=$8) `
	var total int
	err := a.db.QueryRow(r.Context(), `SELECT count(DISTINCT e.id) FROM people.employees e
		JOIN people.employment_records er ON er.employee_id=e.id AND er.valid_to IS NULL
		LEFT JOIN people.employee_contacts c ON c.employee_id=e.id AND c.kind='work_email' AND c.deleted_at IS NULL
		LEFT JOIN people.departments d ON d.id=er.department_id
		WHERE `+filter, ac.OrganisationID, q, dept, designation, manager, status, employmentType, location).Scan(&total)
	if err != nil {
		dbProblem(w, err)
		return
	}
	rows, err := a.db.Query(r.Context(), `SELECT e.id,e.employee_number AS "employeeNumber",concat_ws(' ',e.first_name,e.middle_name,e.last_name) name,
		coalesce(c.value,'') email,coalesce(d.name,'') department,coalesce(ds.name,'') designation,coalesce(concat_ws(' ',m.first_name,m.last_name),'') manager,
		er.employment_type AS "employmentType",initcap(er.status::text) status,coalesce(er.work_location,'') AS "workLocation",e.version
		FROM people.employees e JOIN people.employment_records er ON er.employee_id=e.id AND er.valid_to IS NULL
		LEFT JOIN people.employee_contacts c ON c.employee_id=e.id AND c.kind='work_email' AND c.deleted_at IS NULL
		LEFT JOIN people.departments d ON d.id=er.department_id LEFT JOIN people.designations ds ON ds.id=er.designation_id
		LEFT JOIN people.employees m ON m.id=er.manager_employee_id WHERE `+filter+`
		ORDER BY e.first_name,e.last_name LIMIT $9 OFFSET $10`, ac.OrganisationID, q, dept, designation, manager, status, employmentType, location, size, (page-1)*size)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	items, err := rowsToMaps(rows)
	if err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"items": items, "page": page, "pageSize": size, "total": total})
}

func (a *app) getEmployee(w http.ResponseWriter, r *http.Request, ac actor) {
	var result map[string]any
	row := a.db.QueryRow(r.Context(), `SELECT jsonb_build_object(
		'id',e.id,'employeeNumber',e.employee_number,'firstName',e.first_name,'middleName',e.middle_name,'lastName',e.last_name,
		'preferredName',e.preferred_name,'userId',e.user_id,'version',e.version,
		'employment',jsonb_build_object('id',er.id,'joiningDate',er.joining_date,'employmentType',er.employment_type,
		'departmentId',er.department_id,'designationId',er.designation_id,'managerEmployeeId',er.manager_employee_id,
		'workLocation',er.work_location,'status',er.status,'version',er.version),
		'contacts',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'kind',kind,'value',
		CASE WHEN is_private AND NOT $3 THEN '••••••' ELSE value END,'isPrimary',is_primary,'isPrivate',is_private))
		FROM people.employee_contacts WHERE employee_id=e.id AND deleted_at IS NULL),'[]'::jsonb))
		FROM people.employees e JOIN people.employment_records er ON er.employee_id=e.id AND er.valid_to IS NULL
		WHERE e.id=$1 AND e.organisation_id=$2 AND e.deleted_at IS NULL`, r.PathValue("id"), ac.OrganisationID, ac.Permissions["employee.view_sensitive"])
	var raw []byte
	if err := row.Scan(&raw); err != nil {
		dbProblem(w, err)
		return
	}
	if err := json.Unmarshal(raw, &result); err != nil {
		problem(w, 500, "encoding_error", err.Error())
		return
	}
	writeJSON(w, 200, result)
}

func (a *app) createEmployee(w http.ResponseWriter, r *http.Request, ac actor) {
	var in employeeInput
	if !decode(w, r, &in) {
		return
	}
	if in.EmployeeNumber == "" || in.FirstName == "" || in.LastName == "" || in.JoiningDate == "" || in.EmploymentType == "" {
		problem(w, 422, "validation_error", "employeeNumber, firstName, lastName, joiningDate and employmentType are required")
		return
	}
	if in.EmploymentStatus == "" {
		in.EmploymentStatus = "active"
	}
	tx, err := a.db.BeginTx(r.Context(), pgx.TxOptions{})
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id, employmentID string
	err = tx.QueryRow(r.Context(), `INSERT INTO people.employees(organisation_id,business_unit_id,legal_entity_id,user_id,employee_number,first_name,middle_name,last_name,preferred_name)
		VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, ac.OrganisationID, in.BusinessUnitID, in.LegalEntityID, in.UserID, in.EmployeeNumber, in.FirstName, in.MiddleName, in.LastName, in.PreferredName).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	err = tx.QueryRow(r.Context(), `INSERT INTO people.employment_records(organisation_id,business_unit_id,legal_entity_id,employee_id,department_id,designation_id,manager_employee_id,joining_date,employment_type,work_location,status)
		VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`, ac.OrganisationID, in.BusinessUnitID, in.LegalEntityID, id, in.DepartmentID, in.DesignationID, in.ManagerID, in.JoiningDate, in.EmploymentType, in.WorkLocation, in.EmploymentStatus).Scan(&employmentID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	next := map[string]any{"employeeNumber": in.EmployeeNumber, "departmentId": in.DepartmentID, "designationId": in.DesignationID, "managerEmployeeId": in.ManagerID, "status": in.EmploymentStatus}
	if err = a.appendHistoryAndAudit(r.Context(), tx, ac, id, "employee.created", nil, next); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id, "employmentRecordId": employmentID})
}

func (a *app) updateEmployment(w http.ResponseWriter, r *http.Request, ac actor) {
	var in employeeInput
	if !decode(w, r, &in) {
		return
	}
	var expected int
	if match := r.Header.Get("If-Match"); match != "" {
		expected, _ = strconv.Atoi(strings.Trim(match, "\""))
	}
	if expected < 1 {
		problem(w, 428, "version_required", "If-Match employee version is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var previous []byte
	err = tx.QueryRow(r.Context(), `SELECT jsonb_build_object('departmentId',department_id,'designationId',designation_id,'managerEmployeeId',manager_employee_id,'workLocation',work_location,'status',status)
		FROM people.employment_records WHERE employee_id=$1 AND organisation_id=$2 AND valid_to IS NULL FOR UPDATE`, r.PathValue("id"), ac.OrganisationID).Scan(&previous)
	if err != nil {
		dbProblem(w, err)
		return
	}
	tag, err := tx.Exec(r.Context(), `UPDATE people.employees SET version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2 AND version=$3`, r.PathValue("id"), ac.OrganisationID, expected)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if tag.RowsAffected() == 0 {
		problem(w, 409, "version_conflict", "employee was changed by another request")
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE people.employment_records SET department_id=coalesce($3,department_id),designation_id=coalesce($4,designation_id),
		manager_employee_id=coalesce($5,manager_employee_id),work_location=coalesce($6,work_location),status=coalesce(nullif($7,''),status::text)::people.employment_status,
		version=version+1 WHERE employee_id=$1 AND organisation_id=$2 AND valid_to IS NULL`,
		r.PathValue("id"), ac.OrganisationID, in.DepartmentID, in.DesignationID, in.ManagerID, in.WorkLocation, in.EmploymentStatus)
	if err != nil {
		dbProblem(w, err)
		return
	}
	var old map[string]any
	_ = json.Unmarshal(previous, &old)
	next := map[string]any{"departmentId": in.DepartmentID, "designationId": in.DesignationID, "managerEmployeeId": in.ManagerID, "workLocation": in.WorkLocation, "status": in.EmploymentStatus}
	if err = a.appendHistoryAndAudit(r.Context(), tx, ac, r.PathValue("id"), "employment.changed", old, next); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) deleteEmployee(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ Reason string }
	if !decode(w, r, &in) {
		return
	}
	if strings.TrimSpace(in.Reason) == "" {
		problem(w, 422, "validation_error", "reason is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `UPDATE people.employees SET deleted_at=now(),version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if tag.RowsAffected() != 1 {
		problem(w, 404, "not_found", "employee not found")
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE people.employment_records SET status='terminated',end_date=coalesce(end_date,current_date),valid_to=now(),version=version+1 WHERE employee_id=$1 AND organisation_id=$2 AND valid_to IS NULL`, r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	next := map[string]any{"status": "terminated", "reason": in.Reason}
	if err = a.appendHistoryAndAudit(r.Context(), tx, ac, r.PathValue("id"), "employee.archived", nil, next); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (a *app) appendHistoryAndAudit(ctx context.Context, tx pgx.Tx, ac actor, employeeID, event string, previous, next any) error {
	_, err := tx.Exec(ctx, `INSERT INTO people.employee_history(organisation_id,employee_id,event_type,previous_value,new_value,effective_at,actor_user_id,request_id)
		VALUES($1,$2,$3,$4,$5,now(),$6,$7)`, ac.OrganisationID, employeeID, event, previous, next, ac.UserID, ac.RequestID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,previous_value,new_value,ip_address,request_id)
		VALUES($1,$2,'employee',$3,$4,$5,$6,nullif($7,'')::inet,$8)`, ac.OrganisationID, ac.UserID, employeeID, event, previous, next, ac.IP, ac.RequestID)
	return err
}
func (a *app) audit(ctx context.Context, tx pgx.Tx, ac actor, entity, id, action string, previous, next any) error {
	_, err := tx.Exec(ctx, `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,previous_value,new_value,ip_address,request_id)
		VALUES($1,$2,$3,$4,$5,$6,$7,nullif($8,'')::inet,$9)`, ac.OrganisationID, ac.UserID, entity, id, action, previous, next, ac.IP, ac.RequestID)
	return err
}
func (a *app) outbox(ctx context.Context, tx pgx.Tx, ac actor, topic, entityID string, data any) error {
	payload := map[string]any{
		"entity_id": entityID,
		"organisation_id": ac.OrganisationID,
		"actor_user_id": ac.UserID,
		"request_id": ac.RequestID,
		"data": data,
	}
	_, err := tx.Exec(ctx, `INSERT INTO notifications.outbox(organisation_id,topic,payload) VALUES($1,$2,$3)`,
		ac.OrganisationID, topic, payload)
	return err
}

func (a *app) employeeHistory(w http.ResponseWriter, r *http.Request, ac actor) {
	a.eventRows(w, r, ac, `SELECT id,event_type,previous_value,new_value,effective_at,recorded_at,actor_user_id,request_id FROM people.employee_history WHERE employee_id=$1 AND organisation_id=$2 ORDER BY recorded_at DESC`)
}
func (a *app) employeeAudit(w http.ResponseWriter, r *http.Request, ac actor) {
	a.eventRows(w, r, ac, `SELECT id,action,previous_value,new_value,occurred_at,actor_user_id,request_id,ip_address FROM audit.events WHERE entity_id=$1 AND organisation_id=$2 AND entity_type='employee' ORDER BY occurred_at DESC`)
}
func (a *app) eventRows(w http.ResponseWriter, r *http.Request, ac actor, query string) {
	rows, err := a.db.Query(r.Context(), query, r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}

func (a *app) selfProfile(w http.ResponseWriter, r *http.Request, ac actor) {
	var id string
	err := a.db.QueryRow(r.Context(), `SELECT id FROM people.employees WHERE organisation_id=$1 AND user_id=$2 AND deleted_at IS NULL`, ac.OrganisationID, ac.UserID).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	r.SetPathValue("id", id)
	a.getEmployee(w, r, ac)
}
func (a *app) updateSelfContacts(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Contacts []struct {
			Kind, Value          string
			IsPrimary, IsPrivate bool
		}
	}
	if !decode(w, r, &in) {
		return
	}
	if len(in.Contacts) > 10 {
		problem(w, 422, "validation_error", "a maximum of 10 contacts is allowed")
		return
	}
	for _, c := range in.Contacts {
		if c.Kind != "personal_email" && c.Kind != "phone" && c.Kind != "work_email" {
			problem(w, 422, "validation_error", "contact kind is not editable")
			return
		}
		if strings.TrimSpace(c.Value) == "" {
			problem(w, 422, "validation_error", "contact value is required")
			return
		}
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var employeeID string
	err = tx.QueryRow(r.Context(), `SELECT id FROM people.employees WHERE organisation_id=$1 AND user_id=$2 AND deleted_at IS NULL FOR UPDATE`, ac.OrganisationID, ac.UserID).Scan(&employeeID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	var previous []byte
	err = tx.QueryRow(r.Context(), `SELECT coalesce(jsonb_agg(jsonb_build_object('kind',kind,'value',value,'isPrimary',is_primary,'isPrivate',is_private)),'[]') FROM people.employee_contacts WHERE employee_id=$1 AND deleted_at IS NULL`, employeeID).Scan(&previous)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE people.employee_contacts SET deleted_at=now() WHERE employee_id=$1 AND organisation_id=$2 AND deleted_at IS NULL`, employeeID, ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	for _, c := range in.Contacts {
		_, err = tx.Exec(r.Context(), `INSERT INTO people.employee_contacts(organisation_id,employee_id,kind,value,is_primary,is_private) VALUES($1,$2,$3,$4,$5,$6)`, ac.OrganisationID, employeeID, c.Kind, c.Value, c.IsPrimary, c.IsPrivate)
		if err != nil {
			dbProblem(w, err)
			return
		}
	}
	var old any
	_ = json.Unmarshal(previous, &old)
	if err = a.appendHistoryAndAudit(r.Context(), tx, ac, employeeID, "contacts.updated", old, in.Contacts); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (a *app) team(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `WITH RECURSIVE reports AS(
	SELECT e.id,e.employee_number,concat_ws(' ',e.first_name,e.last_name) name,er.manager_employee_id,1 depth FROM people.employees e JOIN people.employment_records er ON er.employee_id=e.id AND er.valid_to IS NULL
	WHERE e.organisation_id=$1 AND er.manager_employee_id=(SELECT id FROM people.employees WHERE organisation_id=$1 AND user_id=$2)
	UNION ALL SELECT e.id,e.employee_number,concat_ws(' ',e.first_name,e.last_name),er.manager_employee_id,r.depth+1 FROM people.employees e JOIN people.employment_records er ON er.employee_id=e.id AND er.valid_to IS NULL JOIN reports r ON er.manager_employee_id=r.id)
	SELECT * FROM reports ORDER BY depth,name`, ac.OrganisationID, ac.UserID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}

func (a *app) listDepartments(w http.ResponseWriter, r *http.Request, ac actor) {
	status := strings.TrimSpace(r.URL.Query().Get("status"))
	q := "%" + strings.TrimSpace(r.URL.Query().Get("q")) + "%"
	rows, err := a.db.Query(r.Context(), `SELECT id,organisation_id,name,code,description,parent_id,head_employee_id,annual_budget,status,version,created_at,updated_at
		FROM people.departments WHERE organisation_id=$1 AND deleted_at IS NULL
		AND ($2='' OR status::text=$2) AND ($3='%%' OR name ILIKE $3 OR code ILIKE $3) ORDER BY name`, ac.OrganisationID, status, q)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) getDepartment(w http.ResponseWriter, r *http.Request, ac actor) {
	a.getReference(w, r, ac, "people.departments")
}
func (a *app) createDepartment(w http.ResponseWriter, r *http.Request, ac actor) {
	var in departmentInput
	if !decode(w, r, &in) {
		return
	}
	in.Name, in.Code = strings.TrimSpace(in.Name), strings.ToUpper(strings.TrimSpace(in.Code))
	if in.Name == "" || in.Code == "" {
		problem(w, 422, "validation_error", "name and code are required")
		return
	}
	if in.Status == "" {
		in.Status = "active"
	}
	a.createReference(w, r, ac, "department", `INSERT INTO people.departments(organisation_id,name,code,description,parent_id,head_employee_id,annual_budget,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, in.Name, in.Code, in.Description, in.ParentID, in.HeadEmployeeID, in.AnnualBudget, in.Status)
}
func (a *app) listDesignations(w http.ResponseWriter, r *http.Request, ac actor) {
	status := strings.TrimSpace(r.URL.Query().Get("status"))
	q := "%" + strings.TrimSpace(r.URL.Query().Get("q")) + "%"
	rows, err := a.db.Query(r.Context(), `SELECT id,organisation_id,name,code,department_id,parent_id,level,salary_band_min,salary_band_max,status,version
		FROM people.designations WHERE organisation_id=$1 AND deleted_at IS NULL
		AND ($2='' OR status::text=$2) AND ($3='%%' OR name ILIKE $3 OR code ILIKE $3) ORDER BY level,name`, ac.OrganisationID, status, q)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) getDesignation(w http.ResponseWriter, r *http.Request, ac actor) {
	a.getReference(w, r, ac, "people.designations")
}
func (a *app) createDesignation(w http.ResponseWriter, r *http.Request, ac actor) {
	var in designationInput
	if !decode(w, r, &in) {
		return
	}
	in.Name, in.Code = strings.TrimSpace(in.Name), strings.ToUpper(strings.TrimSpace(in.Code))
	if in.Name == "" || in.Code == "" {
		problem(w, 422, "validation_error", "name and code are required")
		return
	}
	if in.Status == "" {
		in.Status = "active"
	}
	a.createReference(w, r, ac, "designation", `INSERT INTO people.designations(organisation_id,name,code,department_id,parent_id,level,salary_band_min,salary_band_max,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, in.Name, in.Code, in.DepartmentID, in.ParentID, in.Level, in.SalaryBandMin, in.SalaryBandMax, in.Status)
}
func (a *app) updateDepartment(w http.ResponseWriter, r *http.Request, ac actor) {
	var in departmentInput
	if !decode(w, r, &in) {
		return
	}
	a.updateReference(w, r, ac, "department", "people.departments", in.Name, in.Code, in.Status)
}
func (a *app) updateDepartmentStatus(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ Status string `json:"status"` }
	if !decode(w, r, &in) {
		return
	}
	a.updateReferenceStatus(w, r, ac, "department", "people.departments", in.Status)
}
func (a *app) updateDesignation(w http.ResponseWriter, r *http.Request, ac actor) {
	var in designationInput
	if !decode(w, r, &in) {
		return
	}
	a.updateReference(w, r, ac, "designation", "people.designations", in.Name, in.Code, in.Status)
}
func (a *app) updateDesignationStatus(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ Status string `json:"status"` }
	if !decode(w, r, &in) {
		return
	}
	a.updateReferenceStatus(w, r, ac, "designation", "people.designations", in.Status)
}
func (a *app) getReference(w http.ResponseWriter, r *http.Request, ac actor, table string) {
	query := `SELECT row_to_json(record) FROM (SELECT * FROM ` + table + ` WHERE id=$1 AND organisation_id=$2 AND deleted_at IS NULL) record`
	var raw json.RawMessage
	if err := a.db.QueryRow(r.Context(), query, r.PathValue("id"), ac.OrganisationID).Scan(&raw); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(raw)
}
func (a *app) updateReferenceStatus(w http.ResponseWriter, r *http.Request, ac actor, entity, table, status string) {
	if status != "active" && status != "inactive" && status != "archived" {
		problem(w, 422, "validation_error", "status must be active, inactive or archived")
		return
	}
	expected, _ := strconv.Atoi(strings.Trim(r.Header.Get("If-Match"), "\""))
	if expected < 1 {
		problem(w, 428, "version_required", "If-Match version is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var before, after json.RawMessage
	if err = tx.QueryRow(r.Context(), `SELECT row_to_json(t) FROM (SELECT id,status,version FROM `+table+` WHERE id=$1 AND organisation_id=$2 AND deleted_at IS NULL FOR UPDATE)t`, r.PathValue("id"), ac.OrganisationID).Scan(&before); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.QueryRow(r.Context(), `UPDATE `+table+` AS target SET status=$4::people.record_status,version=target.version+1,updated_at=now()
		WHERE target.id=$1 AND target.organisation_id=$2 AND target.version=$3 AND target.deleted_at IS NULL RETURNING row_to_json(target)`,
		r.PathValue("id"), ac.OrganisationID, expected, status).Scan(&after); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			problem(w, 409, "version_conflict", "record was changed; refresh and retry")
			return
		}
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, entity, r.PathValue("id"), entity+".status_changed", before, after); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.outbox(r.Context(), tx, ac, "people."+entity+".status_changed.v1", r.PathValue("id"), after); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(after)
}
func (a *app) updateReference(w http.ResponseWriter, r *http.Request, ac actor, entity, table, name, code, status string) {
	expected, _ := strconv.Atoi(strings.Trim(r.Header.Get("If-Match"), "\""))
	if expected < 1 {
		problem(w, 428, "version_required", "If-Match version is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	query := `UPDATE ` + table + ` SET name=coalesce(nullif($4,''),name),code=coalesce(nullif($5,''),code),status=coalesce(nullif($6,''),status::text)::people.record_status,version=version+1 WHERE id=$1 AND organisation_id=$2 AND version=$3 AND deleted_at IS NULL`
	tag, err := tx.Exec(r.Context(), query, r.PathValue("id"), ac.OrganisationID, expected, name, code, status)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if tag.RowsAffected() != 1 {
		problem(w, 409, "version_conflict", "record was changed or does not exist")
		return
	}
	if err = a.audit(r.Context(), tx, ac, entity, r.PathValue("id"), entity+".updated", nil, map[string]string{"name": name, "code": code, "status": status}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (a *app) deleteDepartment(w http.ResponseWriter, r *http.Request, ac actor) {
	a.deleteReference(w, r, ac, "department", "people.departments")
}
func (a *app) deleteDesignation(w http.ResponseWriter, r *http.Request, ac actor) {
	a.deleteReference(w, r, ac, "designation", "people.designations")
}
func (a *app) deleteReference(w http.ResponseWriter, r *http.Request, ac actor, entity, table string) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `UPDATE `+table+` SET deleted_at=now(),status='archived',version=version+1 WHERE id=$1 AND organisation_id=$2 AND deleted_at IS NULL`, r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if tag.RowsAffected() != 1 {
		problem(w, 404, "not_found", "record not found")
		return
	}
	if err = a.audit(r.Context(), tx, ac, entity, r.PathValue("id"), entity+".archived", nil, map[string]string{"status": "archived"}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (a *app) createReference(w http.ResponseWriter, r *http.Request, ac actor, entity, query string, args ...any) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	values := append([]any{ac.OrganisationID}, args...)
	var id string
	if err = tx.QueryRow(r.Context(), query, values...).Scan(&id); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, entity, id, entity+".created", nil, args); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.outbox(r.Context(), tx, ac, "people."+entity+".created.v1", id, map[string]any{"id": id}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	table := "people." + entity + "s"
	var created json.RawMessage
	if err = a.db.QueryRow(r.Context(), `SELECT row_to_json(record) FROM (SELECT * FROM `+table+` WHERE id=$1 AND organisation_id=$2) record`, id, ac.OrganisationID).Scan(&created); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusCreated)
	_, _ = w.Write(created)
}

func actorFrom(r *http.Request) (actor, error) {
	ac := actor{UserID: r.Header.Get("X-Actor-Id"), OrganisationID: r.Header.Get("X-Organisation-Id"), RequestID: r.Header.Get("X-Request-Id"), Permissions: map[string]bool{}}
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		ac.IP = host
	}
	for _, p := range strings.Split(r.Header.Get("X-Permissions"), ",") {
		ac.Permissions[strings.TrimSpace(p)] = true
	}
	if ac.UserID == "" || ac.OrganisationID == "" || ac.RequestID == "" {
		return ac, errors.New("actor, organisation and request context are required")
	}
	return ac, nil
}
func middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}
func decode(w http.ResponseWriter, r *http.Request, v any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(v); err != nil {
		problem(w, 400, "invalid_json", err.Error())
		return false
	}
	return true
}
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func problem(w http.ResponseWriter, status int, code, detail string) {
	requestID := w.Header().Get("X-Request-Id")
	writeJSON(w, status, map[string]any{
		"error": map[string]string{"code": strings.ToUpper(code), "message": detail, "request_id": requestID},
		"detail": detail,
		"status": status,
	})
}
func dbProblem(w http.ResponseWriter, err error) {
	if errors.Is(err, pgx.ErrNoRows) {
		problem(w, 404, "not_found", "record not found")
		return
	}
	var pgError *pgconn.PgError
	if errors.As(err, &pgError) && pgError.Code == "23505" {
		problem(w, 409, "duplicate_code", "A record with this code already exists in the organisation.")
		return
	}
	log.Printf("database error: %v", err)
	problem(w, 500, "database_error", "request could not be completed")
}
func rowsToMaps(rows pgx.Rows) ([]map[string]any, error) {
	fields := rows.FieldDescriptions()
	out := []map[string]any{}
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, err
		}
		m := map[string]any{}
		for i, f := range fields {
			m[string(f.Name)] = values[i]
		}
		out = append(out, m)
	}
	return out, rows.Err()
}
func writeRows(w http.ResponseWriter, rows pgx.Rows) {
	items, err := rowsToMaps(rows)
	if err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"items": items})
}
func positiveInt(raw string, fallback, min, max int) int {
	v, err := strconv.Atoi(raw)
	if err != nil || v < min {
		return fallback
	}
	if v > max {
		return max
	}
	return v
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
		log.Fatalf("%s is required", k)
	}
	return v
}
