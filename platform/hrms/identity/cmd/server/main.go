package main

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type app struct{ db *pgxpool.Pool }
type actor struct {
	UserID, OrganisationID, RequestID, IP string
	Permissions                           map[string]bool
}

func main() {
	db, err := pgxpool.New(context.Background(), mustEnv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err = db.Ping(context.Background()); err != nil {
		log.Fatalf("database unavailable: %v", err)
	}
	a := &app{db: db}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.health)
	mux.HandleFunc("GET /permissions", a.authorize("organisation.manage", a.listPermissions))
	mux.HandleFunc("GET /roles", a.authorize("organisation.manage", a.listRoles))
	mux.HandleFunc("POST /roles", a.authorize("organisation.manage", a.createRole))
	mux.HandleFunc("PUT /roles/{id}/permissions", a.authorize("organisation.manage", a.setRolePermissions))
	mux.HandleFunc("PUT /users/{id}/roles", a.authorize("organisation.manage", a.setUserRoles))
	mux.HandleFunc("POST /invitations", a.authorize("employee.edit", a.invite))
	mux.HandleFunc("POST /invitations/{token}/accept", a.acceptInvitation)
	mux.HandleFunc("POST /sessions", a.createSession)
	mux.HandleFunc("POST /bootstrap", a.bootstrap)
	mux.HandleFunc("POST /users/{id}/suspend", a.authorize("organisation.manage", a.accountStatus("suspended")))
	mux.HandleFunc("POST /users/{id}/reactivate", a.authorize("organisation.manage", a.accountStatus("active")))
	mux.HandleFunc("GET /users/{id}/permissions", a.resolvedPermissions)
	addr := env("IDENTITY_SERVICE_ADDR", ":8082")
	server := &http.Server{Addr: addr, Handler: contentType(mux), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second}
	log.Printf("identity service listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}

func (a *app) health(w http.ResponseWriter, r *http.Request) {
	if err := a.db.Ping(r.Context()); err != nil {
		problem(w, 503, "database_unavailable", err.Error())
		return
	}
	writeJSON(w, 200, map[string]string{"status": "ok", "service": "identity"})
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
func (a *app) listPermissions(w http.ResponseWriter, r *http.Request, _ actor) {
	rows, err := a.db.Query(r.Context(), `SELECT id,key,description FROM identity.permissions ORDER BY key`)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) listRoles(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT r.id,r.name,r.description,r.is_system,coalesce(jsonb_agg(p.key) FILTER(WHERE p.key IS NOT NULL),'[]') permissions FROM identity.roles r LEFT JOIN identity.role_permissions rp ON rp.role_id=r.id LEFT JOIN identity.permissions p ON p.id=rp.permission_id WHERE r.organisation_id=$1 GROUP BY r.id ORDER BY r.name`, ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) createRole(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Name, Description string
		Permissions       []string
	}
	if !decode(w, r, &in) {
		return
	}
	if strings.TrimSpace(in.Name) == "" {
		problem(w, 422, "validation_error", "name is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO identity.roles(organisation_id,name,description) VALUES($1,$2,$3) RETURNING id`, ac.OrganisationID, in.Name, in.Description).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = setPermissions(r.Context(), tx, ac.OrganisationID, id, in.Permissions); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "role", id, "role.created", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) setRolePermissions(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ Permissions []string }
	if !decode(w, r, &in) {
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `DELETE FROM identity.role_permissions WHERE role_id=$1 AND organisation_id=$2`, r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_ = tag
	if err = setPermissions(r.Context(), tx, ac.OrganisationID, r.PathValue("id"), in.Permissions); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "role", r.PathValue("id"), "role.permissions_changed", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}
func setPermissions(ctx context.Context, tx pgx.Tx, orgID, roleID string, keys []string) error {
	if len(keys) == 0 {
		return nil
	}
	tag, err := tx.Exec(ctx, `INSERT INTO identity.role_permissions(organisation_id,role_id,permission_id) SELECT $1,$2,id FROM identity.permissions WHERE key=ANY($3)`, orgID, roleID, keys)
	if err != nil {
		return err
	}
	if int(tag.RowsAffected()) != len(keys) {
		return errors.New("one or more permissions do not exist")
	}
	return nil
}
func (a *app) setUserRoles(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		RoleIDs []string `json:"roleIds"`
	}
	if !decode(w, r, &in) {
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	_, err = tx.Exec(r.Context(), `DELETE FROM identity.user_roles WHERE user_id=$1 AND organisation_id=$2`, r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	for _, roleID := range in.RoleIDs {
		tag, e := tx.Exec(r.Context(), `INSERT INTO identity.user_roles(organisation_id,user_id,role_id) SELECT $1,$2,id FROM identity.roles WHERE id=$3 AND organisation_id=$1`, ac.OrganisationID, r.PathValue("id"), roleID)
		if e != nil || tag.RowsAffected() != 1 {
			problem(w, 422, "invalid_role", "role does not belong to organisation")
			return
		}
	}
	if err = a.audit(r.Context(), tx, ac, "user", r.PathValue("id"), "user.roles_changed", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}

func (a *app) invite(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Email, DisplayName string
		RoleIDs            []string `json:"roleIds"`
	}
	if !decode(w, r, &in) {
		return
	}
	if !strings.Contains(in.Email, "@") {
		problem(w, 422, "validation_error", "valid email is required")
		return
	}
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		problem(w, 500, "token_error", err.Error())
		return
	}
	token := base64.RawURLEncoding.EncodeToString(raw)
	sum := sha256.Sum256([]byte(token))
	hash := hex.EncodeToString(sum[:])
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var userID string
	err = tx.QueryRow(r.Context(), `INSERT INTO identity.users(organisation_id,email,display_name,status,invited_at) VALUES($1,$2,$3,'invited',now()) ON CONFLICT(organisation_id,email) DO UPDATE SET display_name=excluded.display_name,status='invited',invited_at=now(),version=identity.users.version+1 RETURNING id`, ac.OrganisationID, strings.ToLower(strings.TrimSpace(in.Email)), in.DisplayName).Scan(&userID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO identity.invitations(organisation_id,user_id,token_hash,expires_at) VALUES($1,$2,$3,now()+interval '72 hours')`, ac.OrganisationID, userID, hash)
	if err != nil {
		dbProblem(w, err)
		return
	}
	for _, roleID := range in.RoleIDs {
		tag, e := tx.Exec(r.Context(), `INSERT INTO identity.user_roles(organisation_id,user_id,role_id) SELECT $1,$2,id FROM identity.roles WHERE id=$3 AND organisation_id=$1 ON CONFLICT DO NOTHING`, ac.OrganisationID, userID, roleID)
		if e != nil || tag.RowsAffected() > 1 {
			problem(w, 422, "invalid_role", "invalid role assignment")
			return
		}
	}
	if err = a.audit(r.Context(), tx, ac, "user", userID, "user.invited", nil, map[string]any{"email": in.Email}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 202, map[string]any{"userId": userID, "invitationToken": token, "expiresInHours": 72})
}
func (a *app) acceptInvitation(w http.ResponseWriter, r *http.Request) {
	var in struct{ Password string }
	if !decode(w, r, &in) {
		return
	}
	if len(in.Password) < 12 {
		problem(w, 422, "weak_password", "password must contain at least 12 characters")
		return
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		problem(w, 500, "password_error", "password could not be secured")
		return
	}
	sum := sha256.Sum256([]byte(r.PathValue("token")))
	hash := hex.EncodeToString(sum[:])
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var userID, orgID string
	err = tx.QueryRow(r.Context(), `UPDATE identity.invitations SET accepted_at=now() WHERE token_hash=$1 AND accepted_at IS NULL AND expires_at>now() RETURNING user_id,organisation_id`, hash).Scan(&userID, &orgID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE identity.users SET status='active',password_hash=$3,activated_at=now(),suspended_at=NULL,failed_login_count=0,locked_until=NULL,version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2`, userID, orgID, string(passwordHash))
	if err != nil {
		dbProblem(w, err)
		return
	}
	requestID := r.Header.Get("X-Request-Id")
	if requestID == "" {
		problem(w, 400, "request_context_required", "X-Request-Id is required")
		return
	}
	ip := ""
	if host, _, splitErr := net.SplitHostPort(r.RemoteAddr); splitErr == nil {
		ip = host
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,ip_address,request_id) VALUES($1,$2,'user',$2,'user.activated',$3,nullif($4,'')::inet,$5)`, orgID, userID, map[string]string{"status": "active"}, ip, requestID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]string{"status": "active", "userId": userID})
}
func (a *app) createSession(w http.ResponseWriter, r *http.Request) {
	var in struct{ Email, Password, OrganisationID string }
	if !decode(w, r, &in) {
		return
	}
	if in.Email == "" || in.Password == "" || in.OrganisationID == "" {
		problem(w, 422, "validation_error", "email, password and organisationId are required")
		return
	}
	var id, name, status, passwordHash string
	var lockedUntil *time.Time
	err := a.db.QueryRow(r.Context(), `SELECT id,coalesce(display_name,''),status::text,coalesce(password_hash,''),locked_until FROM identity.users WHERE organisation_id=$1 AND email=$2`, in.OrganisationID, strings.ToLower(strings.TrimSpace(in.Email))).Scan(&id, &name, &status, &passwordHash, &lockedUntil)
	if err != nil {
		problem(w, 401, "invalid_credentials", "email or password is incorrect")
		return
	}
	if status != "active" {
		problem(w, 403, "account_inactive", "account is not active")
		return
	}
	if lockedUntil != nil && lockedUntil.After(time.Now()) {
		problem(w, 429, "account_locked", "too many failed attempts")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(in.Password)) != nil {
		_, _ = a.db.Exec(r.Context(), `UPDATE identity.users SET failed_login_count=failed_login_count+1,locked_until=CASE WHEN failed_login_count+1>=5 THEN now()+interval '15 minutes' ELSE locked_until END WHERE id=$1`, id)
		a.loginAudit(r, id, in.OrganisationID, "identity.login_failed")
		problem(w, 401, "invalid_credentials", "email or password is incorrect")
		return
	}
	var permissions []string
	err = a.db.QueryRow(r.Context(), `SELECT coalesce(array_agg(DISTINCT p.key) FILTER(WHERE p.key IS NOT NULL),'{}') FROM identity.users u LEFT JOIN identity.user_roles ur ON ur.user_id=u.id LEFT JOIN identity.role_permissions rp ON rp.role_id=ur.role_id LEFT JOIN identity.permissions p ON p.id=rp.permission_id WHERE u.id=$1 GROUP BY u.id`, id).Scan(&permissions)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, _ = a.db.Exec(r.Context(), `UPDATE identity.users SET failed_login_count=0,locked_until=NULL,updated_at=now() WHERE id=$1`, id)
	a.loginAudit(r, id, in.OrganisationID, "identity.login_succeeded")
	writeJSON(w, 200, map[string]any{"id": id, "email": strings.ToLower(strings.TrimSpace(in.Email)), "name": name, "organisationId": in.OrganisationID, "permissions": permissions, "status": "active"})
}
func (a *app) bootstrap(w http.ResponseWriter, r *http.Request) {
	expected := os.Getenv("HRMS_BOOTSTRAP_TOKEN")
	if expected == "" || r.Header.Get("X-Bootstrap-Token") != expected {
		problem(w, 403, "forbidden", "invalid bootstrap token")
		return
	}
	var in struct{ OrganisationID, UserID, Email, DisplayName string }
	if !decode(w, r, &in) {
		return
	}
	if in.OrganisationID == "" || in.UserID == "" || in.Email == "" {
		problem(w, 422, "validation_error", "organisationId, userId and email are required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var roleID string
	err = tx.QueryRow(r.Context(), `INSERT INTO identity.roles(organisation_id,name,description,is_system) VALUES($1,'Organisation Owner','Full database-driven organisation access',true) ON CONFLICT(organisation_id,name) DO UPDATE SET description=excluded.description RETURNING id`, in.OrganisationID).Scan(&roleID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO identity.role_permissions(organisation_id,role_id,permission_id) SELECT $1,$2,id FROM identity.permissions ON CONFLICT DO NOTHING`, in.OrganisationID, roleID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO identity.users(id,organisation_id,email,display_name,status,activated_at) VALUES($1,$2,$3,$4,'active',now()) ON CONFLICT(id) DO UPDATE SET organisation_id=excluded.organisation_id,email=excluded.email,display_name=excluded.display_name,status='active',activated_at=coalesce(identity.users.activated_at,now())`, in.UserID, in.OrganisationID, strings.ToLower(strings.TrimSpace(in.Email)), in.DisplayName)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO identity.user_roles(organisation_id,user_id,role_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, in.OrganisationID, in.UserID, roleID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	requestID := r.Header.Get("X-Request-Id")
	if requestID == "" {
		problem(w, 400, "request_context_required", "X-Request-Id is required")
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,request_id) VALUES($1,$2,'organisation',$1,'identity.bootstrapped',$3,$4)`, in.OrganisationID, in.UserID, map[string]string{"ownerUserId": in.UserID}, requestID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"organisationId": in.OrganisationID, "ownerRoleId": roleID, "ownerUserId": in.UserID})
}
func (a *app) loginAudit(r *http.Request, userID, organisationID, action string) {
	requestID := r.Header.Get("X-Request-Id")
	if requestID == "" {
		return
	}
	ip := ""
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		ip = host
	}
	_, err := a.db.Exec(r.Context(), `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,ip_address,request_id) VALUES($1,$2,'identity_session',$2,$3,$4,nullif($5,'')::inet,$6)`, organisationID, userID, action, map[string]string{"email": "redacted"}, ip, requestID)
	if err != nil {
		log.Printf("login audit failed: %v", err)
	}
}
func (a *app) accountStatus(status string) func(http.ResponseWriter, *http.Request, actor) {
	return func(w http.ResponseWriter, r *http.Request, ac actor) {
		tx, err := a.db.Begin(r.Context())
		if err != nil {
			dbProblem(w, err)
			return
		}
		defer tx.Rollback(r.Context())
		tag, err := tx.Exec(r.Context(), `UPDATE identity.users SET status=$3::identity.account_status,suspended_at=CASE WHEN $3='suspended' THEN now() ELSE NULL END,activated_at=CASE WHEN $3='active' THEN coalesce(activated_at,now()) ELSE activated_at END,version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2`, r.PathValue("id"), ac.OrganisationID, status)
		if err != nil {
			dbProblem(w, err)
			return
		}
		if tag.RowsAffected() != 1 {
			problem(w, 404, "not_found", "user not found")
			return
		}
		if err = a.audit(r.Context(), tx, ac, "user", r.PathValue("id"), "user."+status, nil, map[string]string{"status": status}); err != nil {
			dbProblem(w, err)
			return
		}
		if err = tx.Commit(r.Context()); err != nil {
			dbProblem(w, err)
			return
		}
		w.WriteHeader(204)
	}
}
func (a *app) resolvedPermissions(w http.ResponseWriter, r *http.Request) {
	ac, err := actorFrom(r)
	if err != nil || ac.UserID != r.PathValue("id") {
		problem(w, 401, "unauthenticated", "users may resolve only their own permissions")
		return
	}
	var status string
	var permissions []string
	err = a.db.QueryRow(r.Context(), `SELECT u.status::text,coalesce(array_agg(DISTINCT p.key) FILTER(WHERE p.key IS NOT NULL),'{}') FROM identity.users u LEFT JOIN identity.user_roles ur ON ur.user_id=u.id LEFT JOIN identity.role_permissions rp ON rp.role_id=ur.role_id LEFT JOIN identity.permissions p ON p.id=rp.permission_id WHERE u.id=$1 AND u.organisation_id=$2 GROUP BY u.id`, ac.UserID, ac.OrganisationID).Scan(&status, &permissions)
	if err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"userId": ac.UserID, "status": status, "permissions": permissions})
}
func (a *app) audit(ctx context.Context, tx pgx.Tx, ac actor, entity, id, action string, previous, next any) error {
	_, err := tx.Exec(ctx, `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,previous_value,new_value,ip_address,request_id) VALUES($1,$2,$3,$4,$5,$6,$7,nullif($8,'')::inet,$9)`, ac.OrganisationID, ac.UserID, entity, id, action, previous, next, ac.IP, ac.RequestID)
	return err
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
func contentType(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func problem(w http.ResponseWriter, status int, code, detail string) {
	writeJSON(w, status, map[string]any{"error": code, "detail": detail, "status": status})
}
func dbProblem(w http.ResponseWriter, err error) {
	if errors.Is(err, pgx.ErrNoRows) {
		problem(w, 404, "not_found", "record not found")
		return
	}
	log.Printf("database error: %v", err)
	problem(w, 500, "database_error", "request could not be completed")
}
func writeRows(w http.ResponseWriter, rows pgx.Rows) {
	fields := rows.FieldDescriptions()
	items := []map[string]any{}
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			dbProblem(w, err)
			return
		}
		m := map[string]any{}
		for i, f := range fields {
			m[string(f.Name)] = values[i]
		}
		items = append(items, m)
	}
	if err := rows.Err(); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"items": items})
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
