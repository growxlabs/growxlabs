package main

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/hrms/learning/internal/domain"
	"growx/hrms/learning/internal/repository"
	"growx/hrms/learning/internal/service"
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
	mux.HandleFunc("GET /courses", a.auth([]string{"learning.view", "learning.manage"}, a.courses))
	mux.HandleFunc("POST /courses", a.auth([]string{"learning.manage"}, a.createCourse))
	mux.HandleFunc("POST /courses/{id}/publish", a.auth([]string{"learning.manage"}, a.publishCourse))
	mux.HandleFunc("POST /courses/{id}/modules", a.auth([]string{"learning.manage"}, a.addModule))
	mux.HandleFunc("POST /modules/{id}/lessons", a.auth([]string{"learning.manage"}, a.addLesson))
	mux.HandleFunc("POST /enrollments", a.auth([]string{"learning.assign", "learning.manage"}, a.enroll))
	mux.HandleFunc("GET /enrollments", a.auth([]string{"learning.view", "learning.assign", "learning.manage"}, a.enrollments))
	mux.HandleFunc("PATCH /enrollments/{id}/lessons/{lessonId}", a.auth([]string{"learning.view"}, a.updateLesson))
	mux.HandleFunc("GET /certificates/{verificationId}", a.auth([]string{"learning.view", "learning.manage"}, a.certificate))
	mux.HandleFunc("POST /v1/learning/ai/recommendations", a.aiRecommendations)
	mux.HandleFunc("POST /v1/learning/ai/skill-gaps", a.aiSkillGaps)
	server := &http.Server{Addr: env("LEARNING_SERVICE_ADDR", ":8086"), Handler: mux, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second}
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
	write(w, 200, map[string]string{"status": "ok", "service": "learning"})
}
func (a *app) createCourse(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.CourseInput
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.CreateCourse(r.Context(), actor, in)
	if err != nil {
		problem(w, 422, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) publishCourse(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	if err := a.svc.Publish(r.Context(), actor, r.PathValue("id")); err != nil {
		problem(w, 409, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) addModule(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.ModuleInput
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.AddModule(r.Context(), actor, r.PathValue("id"), in)
	if err != nil {
		problem(w, 422, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) addLesson(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.LessonInput
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.AddLesson(r.Context(), actor, r.PathValue("id"), in)
	if err != nil {
		problem(w, 422, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) enroll(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.EnrollmentInput
	if !decode(w, r, &in) {
		return
	}
	id, err := a.svc.Enroll(r.Context(), actor, in)
	if err != nil {
		problem(w, 422, err)
		return
	}
	write(w, 201, map[string]string{"id": id})
}
func (a *app) updateLesson(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var in domain.LessonUpdate
	if !decode(w, r, &in) {
		return
	}
	if err := a.svc.UpdateLesson(r.Context(), actor, r.PathValue("id"), r.PathValue("lessonId"), in); err != nil {
		problem(w, 409, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) courses(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	rows, err := a.db.Query(r.Context(), `SELECT c.id,c.code,c.title,c.summary,c.level,c.duration_minutes AS "durationMinutes",c.status,c.compliance,c.certificate_enabled AS "certificateEnabled",(SELECT count(*)FROM learning.course_modules WHERE course_id=c.id)AS modules FROM learning.courses c WHERE c.organisation_id=$1 AND(c.status='PUBLISHED' OR $2)ORDER BY c.title`, actor.OrganisationID, actor.Permissions["learning.manage"])
	if err != nil {
		problem(w, 422, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) enrollments(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	manage := actor.Permissions["learning.assign"] || actor.Permissions["learning.manage"]
	rows, err := a.db.Query(r.Context(), `SELECT e.id,e.course_id AS "courseId",e.employee_id AS "employeeId",c.title,e.status,e.progress_percent AS "progressPercent",e.due_at AS "dueAt",e.completed_at AS "completedAt" FROM learning.enrollments e JOIN learning.courses c ON c.id=e.course_id JOIN people.employees p ON p.id=e.employee_id WHERE e.organisation_id=$1 AND($3 OR p.user_id=$2)ORDER BY e.created_at DESC`, actor.OrganisationID, actor.UserID, manage)
	if err != nil {
		problem(w, 422, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) certificate(w http.ResponseWriter, r *http.Request, actor domain.Actor) {
	var raw []byte
	err := a.db.QueryRow(r.Context(), `SELECT jsonb_build_object('verificationId',c.verification_id,'issuedAt',c.issued_at,'expiresAt',c.expires_at,'status',c.status,'course',jsonb_build_object('code',x.code,'title',x.title),'employee',jsonb_build_object('employeeNumber',p.employee_number,'name',concat_ws(' ',p.first_name,p.last_name)),'documentId',c.document_id)FROM learning.certificates c JOIN learning.courses x ON x.id=c.course_id JOIN people.employees p ON p.id=c.employee_id WHERE c.verification_id=$1 AND c.organisation_id=$2`, r.PathValue("verificationId"), actor.OrganisationID).Scan(&raw)
	if err != nil {
		problem(w, 404, err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(raw)
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
func (a *app) aiRecommendations(w http.ResponseWriter, r *http.Request) {
	ai := NewAILearningAssistant()
	var body struct {
		Role string `json:"role"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	recs := ai.RecommendCourses(body.Role)
	write(w, 200, map[string]any{"recommendations": recs})
}

func (a *app) aiSkillGaps(w http.ResponseWriter, r *http.Request) {
	ai := NewAILearningAssistant()
	var body struct {
		TargetRole string   `json:"target_role"`
		Skills     []string `json:"skills"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	gaps := ai.DetectSkillGaps(body.Skills, body.TargetRole)
	write(w, 200, gaps)
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
