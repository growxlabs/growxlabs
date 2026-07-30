package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type app struct {
	db                      *pgxpool.Pool
	peopleURL, serviceActor string
}
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
		log.Fatal(err)
	}
	a := &app{db: db, peopleURL: strings.TrimRight(env("PEOPLE_SERVICE_URL", "http://localhost:8081"), "/"), serviceActor: mustEnv("RECRUITMENT_SERVICE_ACTOR_ID")}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.health)
	mux.HandleFunc("GET /public/jobs", a.publicJobs)
	mux.HandleFunc("GET /public/jobs/{slug}", a.publicJob)
	mux.HandleFunc("POST /public/jobs/{slug}/applications", a.apply)
	mux.HandleFunc("GET /requisitions", a.authorize("requisition.create", a.listRequisitions))
	mux.HandleFunc("POST /requisitions", a.authorize("requisition.create", a.createRequisition))
	mux.HandleFunc("POST /requisitions/{id}/submit", a.authorize("requisition.create", a.submitRequisition))
	mux.HandleFunc("POST /requisitions/{id}/approve", a.authorizeAny([]string{"requisition.approve_department", "requisition.approve_hr"}, a.approveRequisition))
	mux.HandleFunc("GET /jobs", a.authorize("candidate.view", a.listJobs))
	mux.HandleFunc("POST /jobs", a.authorize("job.create", a.createJob))
	mux.HandleFunc("PATCH /jobs/{id}", a.authorize("job.edit", a.updateJob))
	mux.HandleFunc("POST /jobs/{id}/publish", a.authorize("job.publish", a.publishJob))
	mux.HandleFunc("GET /candidates", a.authorize("candidate.view", a.listCandidates))
	mux.HandleFunc("GET /candidates/{id}", a.authorize("candidate.view", a.getCandidate))
	mux.HandleFunc("GET /candidates/{id}/timeline", a.authorize("candidate.view", a.timeline))
	mux.HandleFunc("POST /candidates/{id}/resume-url", a.authorize("candidate.view", a.candidateResumeURL))
	mux.HandleFunc("POST /candidates/{id}/notes", a.authorize("candidate.note", a.addNote))
	mux.HandleFunc("POST /applications/{id}/stage", a.authorize("candidate.move", a.moveStage))
	mux.HandleFunc("POST /applications/bulk-stage", a.authorize("candidate.move", a.bulkMoveStage))
	mux.HandleFunc("GET /interviews", a.authorize("candidate.view", a.listInterviews))
	mux.HandleFunc("POST /interviews", a.authorize("interview.schedule", a.scheduleInterview))
	mux.HandleFunc("POST /interviews/{id}/feedback", a.authorize("interview.feedback", a.submitFeedback))
	mux.HandleFunc("GET /talent-pools", a.authorize("candidate.view", a.listTalentPools))
	mux.HandleFunc("POST /talent-pools", a.authorize("candidate.note", a.createTalentPool))
	mux.HandleFunc("POST /talent-pools/{id}/members", a.authorize("candidate.note", a.addTalentPoolMember))
	mux.HandleFunc("POST /applications/{id}/ai-result", a.authorize("candidate.view", a.storeAIResult))
	mux.HandleFunc("GET /pipelines", a.authorize("candidate.view", a.listPipelines))
	mux.HandleFunc("POST /pipelines", a.authorize("pipeline.manage", a.createPipeline))
	addr := env("RECRUITMENT_SERVICE_ADDR", ":8083")
	server := &http.Server{Addr: addr, Handler: contentType(mux), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second}
	log.Printf("recruitment service listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}

func (a *app) health(w http.ResponseWriter, r *http.Request) {
	if err := a.db.Ping(r.Context()); err != nil {
		problem(w, 503, "database_unavailable", err.Error())
		return
	}
	writeJSON(w, 200, map[string]string{"status": "ok", "service": "recruitment"})
}
func (a *app) authorize(permission string, next func(http.ResponseWriter, *http.Request, actor)) http.HandlerFunc {
	return a.authorizeAny([]string{permission}, next)
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
		problem(w, 403, "forbidden", "required permission is missing")
	}
}

func (a *app) publicJobs(w http.ResponseWriter, r *http.Request) {
	org := r.URL.Query().Get("organisationId")
	if org == "" {
		problem(w, 422, "organisation_required", "organisationId is required")
		return
	}
	q := "%" + r.URL.Query().Get("q") + "%"
	department, location, employment := r.URL.Query().Get("departmentId"), r.URL.Query().Get("location"), r.URL.Query().Get("employmentType")
	page := positiveInt(r.URL.Query().Get("page"), 1)
	size := positiveInt(r.URL.Query().Get("pageSize"), 20)
	rows, err := a.db.Query(r.Context(), `SELECT id,title,slug,summary,department_id AS "departmentId",employment_type AS "employmentType",location,is_remote AS "isRemote",published_at AS "publishedAt" FROM recruitment.jobs WHERE organisation_id=$1 AND status='published' AND deleted_at IS NULL AND ($2='%%' OR title ILIKE $2 OR summary ILIKE $2 OR $2=ANY(skills)) AND ($3='' OR department_id::text=$3) AND ($4='' OR location=$4) AND ($5='' OR employment_type=$5) ORDER BY published_at DESC LIMIT $6 OFFSET $7`, org, q, department, location, employment, size, (page-1)*size)
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
	writeJSON(w, 200, map[string]any{"items": items, "page": page, "pageSize": size})
}
func (a *app) publicJob(w http.ResponseWriter, r *http.Request) {
	org := r.URL.Query().Get("organisationId")
	var raw []byte
	err := a.db.QueryRow(r.Context(), `SELECT jsonb_build_object('id',id,'title',title,'slug',slug,'summary',summary,'description',description,'responsibilities',responsibilities,'requirements',requirements,'skills',skills,'experienceMin',experience_min,'experienceMax',experience_max,'employmentType',employment_type,'location',location,'isRemote',is_remote,'salaryMin',salary_min,'salaryMax',salary_max,'salaryCurrency',salary_currency,'benefits',benefits,'publishedAt',published_at) FROM recruitment.jobs WHERE organisation_id=$1 AND slug=$2 AND status='published' AND deleted_at IS NULL`, org, r.PathValue("slug")).Scan(&raw)
	if err != nil {
		dbProblem(w, err)
		return
	}
	w.Write(raw)
}
func (a *app) apply(w http.ResponseWriter, r *http.Request) {
	var in struct {
		OrganisationID, FirstName, LastName, Email, Phone, Location, CoverLetter, LinkedInURL, GitHubURL, PortfolioURL, CurrentCompany, Source string
		NoticePeriodDays                                                                                                                       *int
		ExpectedSalary                                                                                                                         *float64
		Consent                                                                                                                                bool
		Resume                                                                                                                                 *struct {
			Name, ContentType, ChecksumSHA256 string
			SizeBytes                         int64
		}
	}
	if !decode(w, r, &in) {
		return
	}
	if !in.Consent || in.OrganisationID == "" || in.FirstName == "" || in.LastName == "" || !strings.Contains(in.Email, "@") {
		problem(w, 422, "validation_error", "identity, organisation and consent are required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var jobID, stageID, candidateID, applicationID string
	err = tx.QueryRow(r.Context(), `SELECT j.id,s.id FROM recruitment.jobs j JOIN recruitment.pipeline_stages s ON s.pipeline_id=j.pipeline_id WHERE j.organisation_id=$1 AND j.slug=$2 AND j.status='published' AND s.position=(SELECT min(position) FROM recruitment.pipeline_stages WHERE pipeline_id=j.pipeline_id)`, in.OrganisationID, r.PathValue("slug")).Scan(&jobID, &stageID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.candidate_profiles(organisation_id,email,first_name,last_name,phone,location,current_company,linkedin_url,github_url,portfolio_url,consent_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now()) ON CONFLICT(organisation_id,email) DO UPDATE SET first_name=excluded.first_name,last_name=excluded.last_name,phone=coalesce(excluded.phone,recruitment.candidate_profiles.phone),updated_at=now(),version=recruitment.candidate_profiles.version+1 RETURNING id`, in.OrganisationID, strings.ToLower(in.Email), in.FirstName, in.LastName, in.Phone, in.Location, in.CurrentCompany, in.LinkedInURL, in.GitHubURL, in.PortfolioURL).Scan(&candidateID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.job_applications(organisation_id,candidate_id,job_id,current_stage_id,cover_letter,notice_period_days,expected_salary,source) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, in.OrganisationID, candidateID, jobID, stageID, in.CoverLetter, in.NoticePeriodDays, in.ExpectedSalary, in.Source).Scan(&applicationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	requestID := requestID(r)
	if err = a.activityAudit(r.Context(), tx, actor{UserID: a.serviceActor, OrganisationID: in.OrganisationID, RequestID: requestID}, candidateID, applicationID, "job_application", applicationID, "candidate.applied", map[string]any{"jobId": jobID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	response := map[string]any{"candidateId": candidateID, "applicationId": applicationID, "status": "active"}
	if in.Resume != nil {
		signed, documentID, uploadErr := a.resumeUpload(r.Context(), in.OrganisationID, candidateID, *in.Resume, requestID)
		if uploadErr != nil {
			response["resumeUploadError"] = uploadErr.Error()
		} else {
			documentTx, beginErr := a.db.Begin(r.Context())
			if beginErr == nil {
				_, beginErr = documentTx.Exec(r.Context(), `INSERT INTO recruitment.candidate_documents(organisation_id,candidate_id,document_id,kind,is_primary) VALUES($1,$2,$3,'resume',true)`, in.OrganisationID, candidateID, documentID)
				if beginErr == nil {
					_, beginErr = documentTx.Exec(r.Context(), `INSERT INTO recruitment.resume_processing_jobs(organisation_id,candidate_id,application_id,document_id) VALUES($1,$2,$3,$4)`, in.OrganisationID, candidateID, applicationID, documentID)
				}
				if beginErr == nil {
					beginErr = documentTx.Commit(r.Context())
				} else {
					_ = documentTx.Rollback(r.Context())
				}
			}
			if beginErr != nil {
				response["resumeProcessingError"] = beginErr.Error()
			} else {
				response["resumeUpload"] = signed
			}
		}
	}
	writeJSON(w, 201, response)
}

func (a *app) resumeUpload(ctx context.Context, org, candidate string, resume struct {
	Name, ContentType, ChecksumSHA256 string
	SizeBytes                         int64
}, requestID string) (map[string]any, string, error) {
	payload, _ := json.Marshal(map[string]any{"ownerEntityType": "candidate", "ownerEntityId": candidate, "name": resume.Name, "contentType": resume.ContentType, "sizeBytes": resume.SizeBytes, "checksumSHA256": resume.ChecksumSHA256})
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, a.peopleURL+"/documents/upload-url", bytes.NewReader(payload))
	if err != nil {
		return nil, "", err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-Actor-Id", a.serviceActor)
	request.Header.Set("X-Organisation-Id", org)
	request.Header.Set("X-Request-Id", requestID)
	request.Header.Set("X-Permissions", "employee.edit")
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, "", err
	}
	defer response.Body.Close()
	var body map[string]any
	if err = json.NewDecoder(response.Body).Decode(&body); err != nil {
		return nil, "", err
	}
	if response.StatusCode >= 300 {
		return nil, "", fmt.Errorf("document service returned %d", response.StatusCode)
	}
	id, _ := body["documentId"].(string)
	return body, id, nil
}

func (a *app) listRequisitions(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT id,title,department_id AS "departmentId",hiring_manager_employee_id AS "hiringManagerEmployeeId",number_of_positions AS "numberOfPositions",employment_type AS "employmentType",target_hiring_date AS "targetHiringDate",status,version FROM recruitment.job_requisitions WHERE organisation_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC`, ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) createRequisition(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		DepartmentID, HiringManagerEmployeeID, Title, EmploymentType, BusinessJustification string
		RecruiterUserID                                                                     string
		NumberOfPositions                                                                   int
		Budget, SalaryBandMin, SalaryBandMax                                                *float64
		TargetHiringDate                                                                    *time.Time
	}
	if !decode(w, r, &in) {
		return
	}
	if in.DepartmentID == "" || in.HiringManagerEmployeeID == "" || in.Title == "" || in.NumberOfPositions < 1 {
		problem(w, 422, "validation_error", "department, manager, title and positions are required")
		return
	}
	if in.RecruiterUserID == "" {
		in.RecruiterUserID = ac.UserID
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.job_requisitions(organisation_id,department_id,hiring_manager_employee_id,recruiter_user_id,title,number_of_positions,employment_type,budget,salary_band_min,salary_band_max,business_justification,target_hiring_date,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`, ac.OrganisationID, in.DepartmentID, in.HiringManagerEmployeeID, in.RecruiterUserID, in.Title, in.NumberOfPositions, in.EmploymentType, in.Budget, in.SalaryBandMin, in.SalaryBandMax, in.BusinessJustification, in.TargetHiringDate, ac.UserID).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, "", "", "job_requisition", id, "requisition.created", in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) submitRequisition(w http.ResponseWriter, r *http.Request, ac actor) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `UPDATE recruitment.job_requisitions SET status='pending_department_head',version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2 AND status='draft'`, r.PathValue("id"), ac.OrganisationID)
	if err != nil || tag.RowsAffected() != 1 {
		problem(w, 409, "invalid_state", "only draft requisitions can be submitted")
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO recruitment.requisition_approvals(organisation_id,requisition_id,step_key,sequence) VALUES($1,$2,'department_head',1),($1,$2,'hr',2) ON CONFLICT DO NOTHING`, ac.OrganisationID, r.PathValue("id"))
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, "", "", "job_requisition", r.PathValue("id"), "requisition.submitted", nil); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) approveRequisition(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ Decision, Comment string }
	if !decode(w, r, &in) {
		return
	}
	if in.Decision != "approved" && in.Decision != "rejected" {
		problem(w, 422, "validation_error", "decision must be approved or rejected")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var current string
	err = tx.QueryRow(r.Context(), `SELECT status::text FROM recruitment.job_requisitions WHERE id=$1 AND organisation_id=$2 FOR UPDATE`, r.PathValue("id"), ac.OrganisationID).Scan(&current)
	if err != nil {
		dbProblem(w, err)
		return
	}
	step := "department_head"
	permission := "requisition.approve_department"
	next := "pending_hr"
	if current == "pending_hr" {
		step = "hr"
		permission = "requisition.approve_hr"
		next = "approved"
	}
	if !ac.Permissions[permission] {
		problem(w, 403, "forbidden", "approval permission missing")
		return
	}
	if in.Decision == "rejected" {
		next = "rejected"
	}
	tag, err := tx.Exec(r.Context(), `UPDATE recruitment.requisition_approvals SET status=$4,approver_user_id=$3,comment=$5,decided_at=now() WHERE requisition_id=$1 AND organisation_id=$2 AND step_key=$6 AND status='pending'`, r.PathValue("id"), ac.OrganisationID, ac.UserID, in.Decision, in.Comment, step)
	if err != nil || tag.RowsAffected() != 1 {
		problem(w, 409, "invalid_state", "approval step is not pending")
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE recruitment.job_requisitions SET status=$3::recruitment.requisition_status,version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2`, r.PathValue("id"), ac.OrganisationID, next)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, "", "", "job_requisition", r.PathValue("id"), "requisition."+in.Decision, map[string]string{"step": step}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}

func (a *app) listJobs(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT id,title,slug,status,department_id AS "departmentId",location,employment_type AS "employmentType",published_at AS "publishedAt",version FROM recruitment.jobs WHERE organisation_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC`, ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) createJob(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		RequisitionID, PipelineID, Title, Slug, Summary, EmploymentType, Location string
		Description, Responsibilities, Requirements, Benefits                     any
		Skills                                                                    []string
		IsRemote                                                                  bool
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
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.jobs(organisation_id,requisition_id,pipeline_id,department_id,hiring_manager_employee_id,recruiter_user_id,title,slug,summary,description,responsibilities,requirements,skills,employment_type,location,is_remote,benefits) SELECT organisation_id,id,$3,department_id,hiring_manager_employee_id,recruiter_user_id,$4,$5,$6,$7,$8,$9,$10,employment_type,$11,$12,$13 FROM recruitment.job_requisitions WHERE id=$1 AND organisation_id=$2 AND status='approved' RETURNING id`, in.RequisitionID, ac.OrganisationID, in.PipelineID, in.Title, in.Slug, in.Summary, in.Description, in.Responsibilities, in.Requirements, in.Skills, in.Location, in.IsRemote, in.Benefits).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, "", "", "job", id, "job.created", in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) updateJob(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ Title, Summary, Location string }
	if !decode(w, r, &in) {
		return
	}
	expected, _ := strconv.Atoi(strings.Trim(r.Header.Get("If-Match"), "\""))
	if expected < 1 {
		problem(w, 428, "version_required", "If-Match is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `UPDATE recruitment.jobs SET title=coalesce(nullif($4,''),title),summary=coalesce(nullif($5,''),summary),location=coalesce(nullif($6,''),location),version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2 AND version=$3 AND status='draft'`, r.PathValue("id"), ac.OrganisationID, expected, in.Title, in.Summary, in.Location)
	if err != nil || tag.RowsAffected() != 1 {
		problem(w, 409, "version_conflict", "draft job changed or not found")
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, "", "", "job", r.PathValue("id"), "job.updated", in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) publishJob(w http.ResponseWriter, r *http.Request, ac actor) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `UPDATE recruitment.jobs SET status='published',published_at=now(),version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2 AND status='draft'`, r.PathValue("id"), ac.OrganisationID)
	if err != nil || tag.RowsAffected() != 1 {
		problem(w, 409, "invalid_state", "only draft jobs can be published")
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, "", "", "job", r.PathValue("id"), "job.published", nil); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}

func (a *app) listCandidates(w http.ResponseWriter, r *http.Request, ac actor) {
	q := "%" + r.URL.Query().Get("q") + "%"
	job, stage := r.URL.Query().Get("jobId"), r.URL.Query().Get("stageId")
	rows, err := a.db.Query(r.Context(), `SELECT c.id,concat_ws(' ',c.first_name,c.last_name) name,c.email,c.location,c.skills,c.current_company AS "currentCompany",a.id AS "applicationId",j.title AS job,s.name AS stage,ai.match_score AS "matchScore",a.updated_at AS "updatedAt" FROM recruitment.candidate_profiles c JOIN recruitment.job_applications a ON a.candidate_id=c.id JOIN recruitment.jobs j ON j.id=a.job_id JOIN recruitment.pipeline_stages s ON s.id=a.current_stage_id LEFT JOIN LATERAL(SELECT match_score FROM recruitment.candidate_ai_results WHERE application_id=a.id ORDER BY created_at DESC LIMIT 1)ai ON true WHERE c.organisation_id=$1 AND c.deleted_at IS NULL AND ($2='%%' OR concat_ws(' ',c.first_name,c.last_name) ILIKE $2 OR c.email ILIKE $2 OR c.current_company ILIKE $2 OR EXISTS(SELECT 1 FROM unnest(c.skills)x WHERE x ILIKE $2)) AND ($3='' OR a.job_id::text=$3) AND ($4='' OR a.current_stage_id::text=$4) AND ($5 OR EXISTS(SELECT 1 FROM people.employees e WHERE e.id=j.hiring_manager_employee_id AND e.user_id=$6 AND e.organisation_id=$1) OR EXISTS(SELECT 1 FROM recruitment.interviews i JOIN recruitment.interviewers ix ON ix.interview_id=i.id WHERE i.application_id=a.id AND ix.user_id=$6)) ORDER BY a.updated_at DESC LIMIT 100`, ac.OrganisationID, q, job, stage, ac.Permissions["candidate.view_all"], ac.UserID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) getCandidate(w http.ResponseWriter, r *http.Request, ac actor) {
	var raw []byte
	err := a.db.QueryRow(r.Context(), `SELECT jsonb_build_object('id',c.id,'firstName',c.first_name,'lastName',c.last_name,'email',c.email,'phone',c.phone,'location',c.location,'professionalSummary',c.professional_summary,'skills',c.skills,'yearsOfExperience',c.years_of_experience,'currentCompany',c.current_company,'currentTitle',c.current_title,'linkedinUrl',c.linkedin_url,'githubUrl',c.github_url,'portfolioUrl',c.portfolio_url,'applications',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'jobId',a.job_id,'jobTitle',j.title,'stageId',a.current_stage_id,'stage',s.name,'status',a.status,'appliedAt',a.applied_at)) FROM recruitment.job_applications a JOIN recruitment.jobs j ON j.id=a.job_id JOIN recruitment.pipeline_stages s ON s.id=a.current_stage_id WHERE a.candidate_id=c.id),'[]'),'ai',coalesce((SELECT to_jsonb(x) FROM(SELECT summary,extracted_skills,years_of_experience,primary_technologies,highlights,concerns,match_score,created_at FROM recruitment.candidate_ai_results WHERE candidate_id=c.id ORDER BY created_at DESC LIMIT 1)x),'{}')) FROM recruitment.candidate_profiles c WHERE c.id=$1 AND c.organisation_id=$2 AND c.deleted_at IS NULL AND ($3 OR EXISTS(SELECT 1 FROM recruitment.job_applications a JOIN recruitment.jobs j ON j.id=a.job_id JOIN people.employees e ON e.id=j.hiring_manager_employee_id WHERE a.candidate_id=c.id AND e.user_id=$4) OR EXISTS(SELECT 1 FROM recruitment.job_applications a JOIN recruitment.interviews i ON i.application_id=a.id JOIN recruitment.interviewers ix ON ix.interview_id=i.id WHERE a.candidate_id=c.id AND ix.user_id=$4))`, r.PathValue("id"), ac.OrganisationID, ac.Permissions["candidate.view_all"], ac.UserID).Scan(&raw)
	if err != nil {
		dbProblem(w, err)
		return
	}
	w.Write(raw)
}
func (a *app) timeline(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT id,action,actor_user_id AS "actorUserId",payload,occurred_at AS "occurredAt" FROM recruitment.activities WHERE organisation_id=$1 AND candidate_id=$2 ORDER BY occurred_at DESC`, ac.OrganisationID, r.PathValue("id"))
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) addNote(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		ApplicationID *string
		Body          string
		IsPrivate     bool
		Mentions      []string
	}
	if !decode(w, r, &in) {
		return
	}
	if strings.TrimSpace(in.Body) == "" {
		problem(w, 422, "validation_error", "note body is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.candidate_notes(organisation_id,candidate_id,application_id,author_user_id,body,is_private,mentions) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ac.OrganisationID, r.PathValue("id"), in.ApplicationID, ac.UserID, in.Body, in.IsPrivate, in.Mentions).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, r.PathValue("id"), value(in.ApplicationID), "candidate_note", id, "candidate.note_added", map[string]any{"private": in.IsPrivate, "mentions": in.Mentions}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) moveStage(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ StageID string }
	if !decode(w, r, &in) {
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var candidateID, oldStage, category string
	err = tx.QueryRow(r.Context(), `SELECT a.candidate_id,a.current_stage_id,s.category FROM recruitment.job_applications a JOIN recruitment.jobs j ON j.id=a.job_id JOIN recruitment.pipeline_stages s ON s.id=$3 AND s.pipeline_id=j.pipeline_id WHERE a.id=$1 AND a.organisation_id=$2 FOR UPDATE`, r.PathValue("id"), ac.OrganisationID, in.StageID).Scan(&candidateID, &oldStage, &category)
	if err != nil {
		dbProblem(w, err)
		return
	}
	status := "active"
	if category != "active" {
		status = category
	}
	_, err = tx.Exec(r.Context(), `UPDATE recruitment.job_applications SET current_stage_id=$3,status=$4::recruitment.application_status,version=version+1,updated_at=now() WHERE id=$1 AND organisation_id=$2`, r.PathValue("id"), ac.OrganisationID, in.StageID, status)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, candidateID, r.PathValue("id"), "job_application", r.PathValue("id"), "candidate.stage_changed", map[string]string{"from": oldStage, "to": in.StageID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}

func (a *app) candidateResumeURL(w http.ResponseWriter, r *http.Request, ac actor) {
	var documentID string
	err := a.db.QueryRow(r.Context(), `SELECT document_id FROM recruitment.candidate_documents WHERE organisation_id=$1 AND candidate_id=$2 AND kind='resume' ORDER BY is_primary DESC,created_at DESC LIMIT 1`, ac.OrganisationID, r.PathValue("id")).Scan(&documentID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	request, err := http.NewRequestWithContext(r.Context(), http.MethodPost, a.peopleURL+"/documents/"+documentID+"/download-url", nil)
	if err != nil {
		problem(w, 500, "request_error", err.Error())
		return
	}
	request.Header.Set("X-Actor-Id", a.serviceActor)
	request.Header.Set("X-Organisation-Id", ac.OrganisationID)
	request.Header.Set("X-Request-Id", ac.RequestID)
	request.Header.Set("X-Permissions", "employee.view")
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		problem(w, 502, "document_service_error", err.Error())
		return
	}
	defer response.Body.Close()
	w.WriteHeader(response.StatusCode)
	_, _ = io.Copy(w, response.Body)
}
func (a *app) bulkMoveStage(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		ApplicationIDs []string
		StageID        string
	}
	if !decode(w, r, &in) {
		return
	}
	if len(in.ApplicationIDs) == 0 || len(in.ApplicationIDs) > 100 || in.StageID == "" {
		problem(w, 422, "validation_error", "1-100 applications and stageID are required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	rows, err := tx.Query(r.Context(), `SELECT a.id,a.candidate_id,a.current_stage_id,s.category FROM recruitment.job_applications a JOIN recruitment.jobs j ON j.id=a.job_id JOIN recruitment.pipeline_stages s ON s.id=$3 AND s.pipeline_id=j.pipeline_id WHERE a.organisation_id=$1 AND a.id=ANY($2::uuid[]) FOR UPDATE`, ac.OrganisationID, in.ApplicationIDs, in.StageID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	type item struct{ id, candidate, old, category string }
	var items []item
	for rows.Next() {
		var x item
		if err = rows.Scan(&x.id, &x.candidate, &x.old, &x.category); err != nil {
			rows.Close()
			dbProblem(w, err)
			return
		}
		items = append(items, x)
	}
	rows.Close()
	if len(items) != len(in.ApplicationIDs) {
		problem(w, 409, "invalid_stage", "stage does not belong to every selected job pipeline")
		return
	}
	for _, x := range items {
		status := "active"
		if x.category != "active" {
			status = x.category
		}
		if _, err = tx.Exec(r.Context(), `UPDATE recruitment.job_applications SET current_stage_id=$2,status=$3::recruitment.application_status,version=version+1,updated_at=now() WHERE id=$1`, x.id, in.StageID, status); err != nil {
			dbProblem(w, err)
			return
		}
		if err = a.activityAudit(r.Context(), tx, ac, x.candidate, x.id, "job_application", x.id, "candidate.stage_changed", map[string]string{"from": x.old, "to": in.StageID, "mode": "bulk"}); err != nil {
			dbProblem(w, err)
			return
		}
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]int{"updated": len(items)})
}
func (a *app) listInterviews(w http.ResponseWriter, r *http.Request, ac actor) {
	applicationID := r.URL.Query().Get("applicationId")
	rows, err := a.db.Query(r.Context(), `SELECT i.id,i.application_id AS "applicationId",i.title,i.status,i.starts_at AS "startsAt",i.ends_at AS "endsAt",i.timezone,i.location,i.meeting_url AS "meetingUrl",coalesce(jsonb_agg(jsonb_build_object('userId',x.user_id,'isLead',x.is_lead)) FILTER(WHERE x.user_id IS NOT NULL),'[]') interviewers,EXISTS(SELECT 1 FROM recruitment.interview_feedback f WHERE f.interview_id=i.id AND f.interviewer_user_id=$3) AS "feedbackSubmitted" FROM recruitment.interviews i LEFT JOIN recruitment.interviewers x ON x.interview_id=i.id WHERE i.organisation_id=$1 AND ($2='' OR i.application_id::text=$2) AND ($4 OR EXISTS(SELECT 1 FROM recruitment.interviewers mine WHERE mine.interview_id=i.id AND mine.user_id=$3)) GROUP BY i.id ORDER BY i.starts_at`, ac.OrganisationID, applicationID, ac.UserID, ac.Permissions["candidate.view_all"])
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) listTalentPools(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT p.id,p.name,p.description,p.is_private AS "isPrivate",count(m.candidate_id) AS "memberCount" FROM recruitment.talent_pools p LEFT JOIN recruitment.talent_pool_members m ON m.pool_id=p.id WHERE p.organisation_id=$1 GROUP BY p.id ORDER BY p.name`, ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) createTalentPool(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Name, Description string
		IsPrivate         bool
	}
	if !decode(w, r, &in) {
		return
	}
	if strings.TrimSpace(in.Name) == "" {
		problem(w, 422, "validation_error", "name is required")
		return
	}
	var id string
	err := a.db.QueryRow(r.Context(), `INSERT INTO recruitment.talent_pools(organisation_id,name,description,is_private,created_by) VALUES($1,$2,$3,$4,$5) RETURNING id`, ac.OrganisationID, in.Name, in.Description, in.IsPrivate, ac.UserID).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) addTalentPoolMember(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ CandidateID string }
	if !decode(w, r, &in) {
		return
	}
	_, err := a.db.Exec(r.Context(), `INSERT INTO recruitment.talent_pool_members(organisation_id,pool_id,candidate_id,added_by) SELECT $1,p.id,c.id,$4 FROM recruitment.talent_pools p JOIN recruitment.candidate_profiles c ON c.id=$3 AND c.organisation_id=$1 WHERE p.id=$2 AND p.organisation_id=$1 ON CONFLICT DO NOTHING`, ac.OrganisationID, r.PathValue("id"), in.CandidateID, ac.UserID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}

func (a *app) scheduleInterview(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		ApplicationID, Title, Timezone string
		PlanRoundID                    *string
		StartsAt, EndsAt               time.Time
		Location, MeetingURL           string
		InterviewerUserIDs             []string
	}
	if !decode(w, r, &in) {
		return
	}
	if !in.EndsAt.After(in.StartsAt) || len(in.InterviewerUserIDs) == 0 {
		problem(w, 422, "validation_error", "valid times and interviewers are required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id, candidateID string
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.interviews(organisation_id,application_id,plan_round_id,title,status,starts_at,ends_at,timezone,location,meeting_url,created_by) SELECT $1,a.id,$3,$4,'scheduled',$5,$6,$7,$8,$9,$10 FROM recruitment.job_applications a WHERE a.id=$2 AND a.organisation_id=$1 RETURNING id,(SELECT candidate_id FROM recruitment.job_applications WHERE id=$2)`, ac.OrganisationID, in.ApplicationID, in.PlanRoundID, in.Title, in.StartsAt, in.EndsAt, in.Timezone, in.Location, in.MeetingURL, ac.UserID).Scan(&id, &candidateID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	for index, userID := range in.InterviewerUserIDs {
		_, err = tx.Exec(r.Context(), `INSERT INTO recruitment.interviewers(organisation_id,interview_id,user_id,is_lead) VALUES($1,$2,$3,$4)`, ac.OrganisationID, id, userID, index == 0)
		if err != nil {
			dbProblem(w, err)
			return
		}
	}
	if err = a.activityAudit(r.Context(), tx, ac, candidateID, in.ApplicationID, "interview", id, "interview.scheduled", map[string]any{"startsAt": in.StartsAt, "interviewers": in.InterviewerUserIDs}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) submitFeedback(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Ratings                  map[string]any
		Comments, Recommendation string
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
	var id, candidateID, applicationID string
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.interview_feedback(organisation_id,interview_id,interviewer_user_id,ratings,comments,recommendation) SELECT $1,i.id,$3,$4,$5,$6 FROM recruitment.interviews i JOIN recruitment.interviewers x ON x.interview_id=i.id AND x.user_id=$3 WHERE i.id=$2 AND i.organisation_id=$1 RETURNING id,(SELECT a.candidate_id FROM recruitment.interviews z JOIN recruitment.job_applications a ON a.id=z.application_id WHERE z.id=$2),(SELECT application_id FROM recruitment.interviews WHERE id=$2)`, ac.OrganisationID, r.PathValue("id"), ac.UserID, in.Ratings, in.Comments, in.Recommendation).Scan(&id, &candidateID, &applicationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, candidateID, applicationID, "interview_feedback", id, "interview.feedback_submitted", map[string]string{"recommendation": in.Recommendation}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) storeAIResult(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Model, PromptVersion, Summary        string
		ExtractedSkills, PrimaryTechnologies []string
		YearsOfExperience, MatchScore        *float64
		Highlights, Concerns, RawResult      any
		DocumentID                           *string
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
	var id, candidateID string
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.candidate_ai_results(organisation_id,candidate_id,application_id,document_id,model,prompt_version,summary,extracted_skills,years_of_experience,primary_technologies,highlights,concerns,match_score,raw_result) SELECT $1,a.candidate_id,a.id,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13 FROM recruitment.job_applications a WHERE a.id=$2 AND a.organisation_id=$1 RETURNING id,candidate_id`, ac.OrganisationID, r.PathValue("id"), in.DocumentID, in.Model, in.PromptVersion, in.Summary, in.ExtractedSkills, in.YearsOfExperience, in.PrimaryTechnologies, in.Highlights, in.Concerns, in.MatchScore, in.RawResult).Scan(&id, &candidateID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.activityAudit(r.Context(), tx, ac, candidateID, r.PathValue("id"), "candidate_ai_result", id, "candidate.ai_scored", map[string]any{"matchScore": in.MatchScore, "model": in.Model}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) listPipelines(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT p.id,p.name,p.is_default AS "isDefault",p.version,coalesce(jsonb_agg(jsonb_build_object('id',s.id,'key',s.key,'name',s.name,'position',s.position,'category',s.category,'isTerminal',s.is_terminal) ORDER BY s.position) FILTER(WHERE s.id IS NOT NULL),'[]') stages FROM recruitment.pipeline_definitions p LEFT JOIN recruitment.pipeline_stages s ON s.pipeline_id=p.id WHERE p.organisation_id=$1 GROUP BY p.id ORDER BY p.name`, ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) createPipeline(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Name      string
		IsDefault bool
		Stages    []struct {
			Key, Name, Category string
			IsTerminal          bool
			SLAHours            *int
		}
	}
	if !decode(w, r, &in) {
		return
	}
	if in.Name == "" || len(in.Stages) < 2 {
		problem(w, 422, "validation_error", "pipeline requires a name and at least two stages")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	if in.IsDefault {
		_, err = tx.Exec(r.Context(), `UPDATE recruitment.pipeline_definitions SET is_default=false WHERE organisation_id=$1`, ac.OrganisationID)
		if err != nil {
			dbProblem(w, err)
			return
		}
	}
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO recruitment.pipeline_definitions(organisation_id,name,is_default) VALUES($1,$2,$3) RETURNING id`, ac.OrganisationID, in.Name, in.IsDefault).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	for index, stage := range in.Stages {
		_, err = tx.Exec(r.Context(), `INSERT INTO recruitment.pipeline_stages(organisation_id,pipeline_id,key,name,position,category,is_terminal,sla_hours) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`, ac.OrganisationID, id, stage.Key, stage.Name, index+1, stage.Category, stage.IsTerminal, stage.SLAHours)
		if err != nil {
			dbProblem(w, err)
			return
		}
	}
	if err = a.activityAudit(r.Context(), tx, ac, "", "", "pipeline", id, "pipeline.created", in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}

func (a *app) activityAudit(ctx context.Context, tx pgx.Tx, ac actor, candidateID, applicationID, entityType, entityID, action string, payload any) error {
	var candidate, application any
	if candidateID != "" {
		candidate = candidateID
	}
	if applicationID != "" {
		application = applicationID
	}
	_, err := tx.Exec(ctx, `INSERT INTO recruitment.activities(organisation_id,candidate_id,application_id,entity_type,entity_id,action,actor_user_id,payload,request_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, ac.OrganisationID, candidate, application, entityType, entityID, action, nullable(ac.UserID), payload, ac.RequestID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,ip_address,request_id) VALUES($1,$2,$3,$4,$5,$6,nullif($7,'')::inet,$8)`, ac.OrganisationID, nullable(ac.UserID), entityType, entityID, action, payload, ac.IP, ac.RequestID)
	return err
}
func actorFrom(r *http.Request) (actor, error) {
	ac := actor{UserID: r.Header.Get("X-Actor-Id"), OrganisationID: r.Header.Get("X-Organisation-Id"), RequestID: requestID(r), Permissions: map[string]bool{}}
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		ac.IP = host
	}
	for _, p := range strings.Split(r.Header.Get("X-Permissions"), ",") {
		ac.Permissions[strings.TrimSpace(p)] = true
	}
	if ac.UserID == "" || ac.OrganisationID == "" {
		return ac, errors.New("actor and organisation context are required")
	}
	return ac, nil
}
func requestID(r *http.Request) string {
	if v := r.Header.Get("X-Request-Id"); v != "" {
		return v
	}
	return "00000000-0000-0000-0000-000000000001"
}
func nullable(v string) any {
	if v == "" {
		return nil
	}
	return v
}
func value(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}
func decode(w http.ResponseWriter, r *http.Request, v any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 2<<20)
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
func rowsToMaps(rows pgx.Rows) ([]map[string]any, error) {
	fields := rows.FieldDescriptions()
	items := []map[string]any{}
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, err
		}
		item := map[string]any{}
		for i, field := range fields {
			item[string(field.Name)] = values[i]
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
func writeRows(w http.ResponseWriter, rows pgx.Rows) {
	items, err := rowsToMaps(rows)
	if err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"items": items})
}
func positiveInt(raw string, fallback int) int {
	value, err := strconv.Atoi(raw)
	if err != nil || value < 1 {
		return fallback
	}
	if value > 100 {
		return 100
	}
	return value
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
