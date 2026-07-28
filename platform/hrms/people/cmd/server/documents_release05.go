package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5"
	"net/http"
	"regexp"
	"strings"
	"time"
)

var checksumPattern = regexp.MustCompile(`^[a-fA-F0-9]{64}$`)
var allowedDocumentMIME = map[string]bool{
	"application/pdf": true, "image/jpeg": true, "image/png": true,
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	"application/msword": true, "text/plain": true, "text/html": true,
}

func validateDocumentFile(name, mime, checksum string, size int64) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("name is required")
	}
	if !allowedDocumentMIME[mime] {
		return errors.New("unsupported document MIME type")
	}
	if size < 1 || size > 25<<20 {
		return errors.New("document size must be between 1 byte and 25MB")
	}
	if !checksumPattern.MatchString(checksum) {
		return errors.New("checksumSHA256 must be a 64 character hexadecimal SHA-256")
	}
	return nil
}
func (a *app) documentOutbox(ctx context.Context, tx pgx.Tx, ac actor, topic string, payload any) error {
	_, err := tx.Exec(ctx, `INSERT INTO documents.outbox(organisation_id,topic,payload) VALUES($1,$2,$3)`, ac.OrganisationID, topic, payload)
	return err
}
func (a *app) listDocumentCategories(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT id,parent_id AS "parentId",name,description,retention_days AS "retentionDays",metadata_schema AS "metadataSchema",status FROM documents.categories WHERE organisation_id=$1 AND status='active' ORDER BY name`, ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) createDocumentCategory(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Name, Description string
		ParentID          *string        `json:"parentId"`
		RetentionDays     *int           `json:"retentionDays"`
		MetadataSchema    map[string]any `json:"metadataSchema"`
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
	err = tx.QueryRow(r.Context(), `INSERT INTO documents.categories(organisation_id,parent_id,name,description,retention_days,metadata_schema,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`, ac.OrganisationID, in.ParentID, in.Name, in.Description, in.RetentionDays, in.MetadataSchema, ac.UserID).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document_category", id, "document.category_created", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.category_created", map[string]string{"categoryId": id}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) getDocument(w http.ResponseWriter, r *http.Request, ac actor) {
	if err := a.requireDocumentAccess(r.Context(), ac, r.PathValue("id")); err != nil {
		problem(w, 403, "forbidden", err.Error())
		return
	}
	var raw []byte
	err := a.db.QueryRow(r.Context(), `SELECT jsonb_build_object('id',d.id,'name',d.name,'description',d.description,'ownerEntityType',d.owner_entity_type,'ownerEntityId',d.owner_entity_id,'categoryId',d.category_id,'metadata',d.metadata,'tags',d.tags,'expiresAt',d.expires_at,'verificationStatus',d.verification_status,'verificationComment',d.verification_comment,'versions',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',v.id,'version',v.version,'contentType',v.content_type,'sizeBytes',v.size_bytes,'checksumSHA256',v.checksum_sha256,'virusScanStatus',v.virus_scan_status,'uploadStatus',v.upload_status,'createdAt',v.created_at) ORDER BY v.version DESC),'[]') FROM documents.versions v WHERE v.document_id=d.id),'timeline',(SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY l.occurred_at DESC),'[]') FROM documents.access_logs l WHERE l.document_id=d.id)) FROM documents.documents d WHERE d.id=$1 AND d.organisation_id=$2 AND d.deleted_at IS NULL`, r.PathValue("id"), ac.OrganisationID).Scan(&raw)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, _ = w.Write(raw)
}
func (a *app) completeDocumentUpload(w http.ResponseWriter, r *http.Request, ac actor) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `UPDATE documents.versions SET upload_status='UPLOADED' WHERE id=$1 AND document_id=$2 AND organisation_id=$3 AND upload_status='PENDING'`, r.PathValue("versionId"), r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if tag.RowsAffected() != 1 {
		problem(w, 409, "invalid_upload_state", "pending upload not found")
		return
	}
	if err = a.documentAccess(r.Context(), tx, ac, r.PathValue("id"), r.PathValue("versionId"), "upload_completed"); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", r.PathValue("id"), "document.upload_completed", nil, map[string]string{"versionId": r.PathValue("versionId")}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.uploaded", map[string]string{"documentId": r.PathValue("id"), "versionId": r.PathValue("versionId")}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) createDocumentVersionDownload(w http.ResponseWriter, r *http.Request, ac actor) {
	if err := a.requireDocumentAccess(r.Context(), ac, r.PathValue("id")); err != nil {
		problem(w, 403, "forbidden", err.Error())
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var key string
	err = tx.QueryRow(r.Context(), `SELECT storage_object_key FROM documents.versions WHERE id=$1 AND document_id=$2 AND organisation_id=$3 AND upload_status='UPLOADED'`, r.PathValue("versionId"), r.PathValue("id"), ac.OrganisationID).Scan(&key)
	if err != nil {
		dbProblem(w, err)
		return
	}
	url, err := a.storage.GetSignedURL(r.Context(), key, 5*time.Minute)
	if err != nil {
		problem(w, 502, "signing_failed", err.Error())
		return
	}
	if err = a.documentAccess(r.Context(), tx, ac, r.PathValue("id"), r.PathValue("versionId"), "version_download_url_created"); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", r.PathValue("id"), "document.version_downloaded", nil, map[string]string{"versionId": r.PathValue("versionId")}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.version_downloaded", map[string]string{"documentId": r.PathValue("id"), "versionId": r.PathValue("versionId")}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"downloadUrl": url, "expiresInSeconds": 300})
}
func (a *app) requireDocumentAccess(ctx context.Context, ac actor, documentID string) error {
	if ac.Permissions["documents.manage"] || ac.Permissions["documents.verify"] || ac.Permissions["employee.view"] {
		return nil
	}
	var allowed bool
	err := a.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM documents.documents d LEFT JOIN people.employees e ON d.owner_entity_type='employee' AND e.id=d.owner_entity_id WHERE d.id=$1 AND d.organisation_id=$2 AND d.deleted_at IS NULL AND(e.user_id=$3 OR d.owner_entity_type='organisation' OR EXISTS(SELECT 1 FROM documents.permissions p WHERE p.document_id=d.id AND p.organisation_id=$2 AND p.subject_type='USER' AND p.subject_id=$3)))`, documentID, ac.OrganisationID, ac.UserID).Scan(&allowed)
	if err != nil {
		return err
	}
	if !allowed {
		return errors.New("document access denied")
	}
	return nil
}
func (a *app) restoreDocumentVersion(w http.ResponseWriter, r *http.Request, ac actor) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var sourceKey, mime, checksum, name string
	var size int64
	err = tx.QueryRow(r.Context(), `SELECT v.storage_object_key,v.content_type,v.size_bytes,v.checksum_sha256,coalesce(v.original_filename,d.name) FROM documents.versions v JOIN documents.documents d ON d.id=v.document_id WHERE v.id=$1 AND v.document_id=$2 AND v.organisation_id=$3 AND v.upload_status='UPLOADED' FOR UPDATE`, r.PathValue("versionId"), r.PathValue("id"), ac.OrganisationID).Scan(&sourceKey, &mime, &size, &checksum, &name)
	if err != nil {
		dbProblem(w, err)
		return
	}
	var next int
	err = tx.QueryRow(r.Context(), `SELECT coalesce(max(version),0)+1 FROM documents.versions WHERE document_id=$1`, r.PathValue("id")).Scan(&next)
	if err != nil {
		dbProblem(w, err)
		return
	}
	target := fmt.Sprintf("%s/document/%s/%d-%s", ac.OrganisationID, r.PathValue("id"), next, safeObjectName(name))
	body, err := a.storage.Download(r.Context(), sourceKey)
	if err != nil {
		problem(w, 502, "storage_download_failed", err.Error())
		return
	}
	defer body.Close()
	if err = a.storage.Upload(r.Context(), target, body, mime); err != nil {
		problem(w, 502, "storage_upload_failed", err.Error())
		return
	}
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO documents.versions(organisation_id,document_id,version,storage_object_key,content_type,size_bytes,checksum_sha256,uploaded_by,original_filename,virus_scan_status,upload_status,restored_from_version_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING','UPLOADED',$10) RETURNING id`, ac.OrganisationID, r.PathValue("id"), next, target, mime, size, checksum, ac.UserID, name, r.PathValue("versionId")).Scan(&id)
	if err != nil {
		_ = a.storage.Delete(r.Context(), target)
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", r.PathValue("id"), "document.version_restored", nil, map[string]any{"versionId": id, "version": next, "restoredFromVersionId": r.PathValue("versionId")}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.version_restored", map[string]any{"documentId": r.PathValue("id"), "versionId": id}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]any{"versionId": id, "version": next})
}
func (a *app) createDocumentRequest(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		EmployeeID, RequestedName, Instructions string
		CategoryID                              *string    `json:"categoryId"`
		DueAt                                   *time.Time `json:"dueAt"`
		ExpiresAt                               *string    `json:"expiresAt"`
	}
	if !decode(w, r, &in) {
		return
	}
	if in.EmployeeID == "" || in.RequestedName == "" {
		problem(w, 422, "validation_error", "employeeId and requestedName are required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO documents.requests(organisation_id,employee_id,category_id,requested_name,instructions,due_at,expires_at,requested_by) SELECT $1,id,$3,$4,$5,$6,$7,$8 FROM people.employees WHERE id=$2 AND organisation_id=$1 AND deleted_at IS NULL RETURNING id`, ac.OrganisationID, in.EmployeeID, in.CategoryID, in.RequestedName, in.Instructions, in.DueAt, in.ExpiresAt, ac.UserID).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document_request", id, "document.requested", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.requested", map[string]any{"requestId": id, "employeeId": in.EmployeeID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) listDocumentRequests(w http.ResponseWriter, r *http.Request, ac actor) {
	manager := ac.Permissions["documents.manage"] || ac.Permissions["documents.verify"] || ac.Permissions["documents.request"]
	rows, err := a.db.Query(r.Context(), `SELECT r.id,r.employee_id AS "employeeId",r.requested_name AS "requestedName",r.instructions,r.due_at AS "dueAt",r.expires_at AS "expiresAt",r.status,r.document_id AS "documentId",r.review_comment AS "reviewComment",r.created_at AS "createdAt" FROM documents.requests r JOIN people.employees e ON e.id=r.employee_id WHERE r.organisation_id=$1 AND ($3 OR e.user_id=$2) ORDER BY r.created_at DESC LIMIT 200`, ac.OrganisationID, ac.UserID, manager)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) submitDocumentRequest(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		DocumentID string `json:"documentId"`
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
	tag, err := tx.Exec(r.Context(), `UPDATE documents.requests r SET document_id=$3,status='UNDER_REVIEW',submitted_at=now(),updated_at=now() FROM people.employees e,documents.documents d WHERE r.id=$1 AND r.organisation_id=$2 AND e.id=r.employee_id AND e.user_id=$4 AND d.id=$3 AND d.organisation_id=$2 AND d.owner_entity_id=e.id AND r.status IN ('REQUESTED','REJECTED')`, r.PathValue("id"), ac.OrganisationID, in.DocumentID, ac.UserID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if tag.RowsAffected() != 1 {
		problem(w, 409, "invalid_request_state", "request cannot be submitted")
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document_request", r.PathValue("id"), "document.request_submitted", nil, map[string]string{"documentId": in.DocumentID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.under_review", map[string]string{"requestId": r.PathValue("id"), "documentId": in.DocumentID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) verifyDocumentRequest(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ Decision, Comment string }
	if !decode(w, r, &in) {
		return
	}
	if in.Decision != "APPROVED" && in.Decision != "REJECTED" && in.Decision != "REUPLOAD_REQUIRED" {
		problem(w, 422, "validation_error", "decision must be APPROVED, REJECTED or REUPLOAD_REQUIRED")
		return
	}
	requestStatus := in.Decision
	if in.Decision == "REUPLOAD_REQUIRED" {
		requestStatus = "REJECTED"
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var documentID string
	err = tx.QueryRow(r.Context(), `UPDATE documents.requests SET status=$3,reviewed_by=$4,reviewed_at=now(),review_comment=$5,updated_at=now() WHERE id=$1 AND organisation_id=$2 AND status='UNDER_REVIEW' RETURNING document_id`, r.PathValue("id"), ac.OrganisationID, requestStatus, ac.UserID, in.Comment).Scan(&documentID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE documents.documents SET verification_status=$3,verified_by=$4,verified_at=now(),verification_comment=$5,updated_at=now() WHERE id=$1 AND organisation_id=$2`, documentID, ac.OrganisationID, in.Decision, ac.UserID, in.Comment)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", documentID, "document.verified", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.verification_completed", map[string]any{"requestId": r.PathValue("id"), "documentId": documentID, "decision": in.Decision}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}
func (a *app) acknowledgeDocument(w http.ResponseWriter, r *http.Request, ac actor) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var employeeID, versionID string
	err = tx.QueryRow(r.Context(), `SELECT e.id,v.id FROM people.employees e JOIN documents.documents d ON d.id=$3 AND d.organisation_id=e.organisation_id JOIN LATERAL(SELECT id FROM documents.versions WHERE document_id=d.id AND upload_status='UPLOADED' ORDER BY version DESC LIMIT 1)v ON true WHERE e.organisation_id=$1 AND e.user_id=$2`, ac.OrganisationID, ac.UserID, r.PathValue("id")).Scan(&employeeID, &versionID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO documents.acknowledgements(organisation_id,document_id,version_id,employee_id,acknowledged_by,ip_address,request_id) VALUES($1,$2,$3,$4,$5,nullif($6,'')::inet,$7) ON CONFLICT DO NOTHING`, ac.OrganisationID, r.PathValue("id"), versionID, employeeID, ac.UserID, ac.IP, ac.RequestID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", r.PathValue("id"), "document.acknowledged", nil, map[string]string{"versionId": versionID, "employeeId": employeeID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.acknowledged", map[string]string{"documentId": r.PathValue("id"), "employeeId": employeeID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(204)
}
