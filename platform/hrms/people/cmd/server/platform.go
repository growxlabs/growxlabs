package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

func (a *app) createDocumentUpload(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		CategoryID                                                        *string `json:"categoryId"`
		OwnerEntityType, OwnerEntityID, Name, ContentType, ChecksumSHA256 string
		SizeBytes                                                         int64
		Metadata                                                          map[string]any
		Tags                                                              []string
		ExpiresAt                                                         *string
	}
	if !decode(w, r, &in) {
		return
	}
	if err := validateDocumentFile(in.Name, in.ContentType, in.ChecksumSHA256, in.SizeBytes); err != nil {
		problem(w, 422, "validation_error", err.Error())
		return
	}
	if in.OwnerEntityType == "" || in.OwnerEntityID == "" {
		problem(w, 422, "validation_error", "owner is required")
		return
	}
	if !ac.Permissions["documents.manage"] && in.OwnerEntityType == "employee" {
		var ownID string
		if err := a.db.QueryRow(r.Context(), `SELECT id FROM people.employees WHERE organisation_id=$1 AND user_id=$2 AND deleted_at IS NULL`, ac.OrganisationID, ac.UserID).Scan(&ownID); err != nil || ownID != in.OwnerEntityID {
			problem(w, 403, "forbidden", "employees may only upload their own documents")
			return
		}
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var documentID, versionID string
	err = tx.QueryRow(r.Context(), `INSERT INTO documents.documents(organisation_id,category_id,owner_entity_type,owner_entity_id,name,metadata,tags,expires_at,verification_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'PENDING') RETURNING id`, ac.OrganisationID, in.CategoryID, in.OwnerEntityType, in.OwnerEntityID, in.Name, in.Metadata, in.Tags, in.ExpiresAt).Scan(&documentID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	objectKey := strings.Join([]string{ac.OrganisationID, in.OwnerEntityType, documentID, "1-" + safeObjectName(in.Name)}, "/")
	err = tx.QueryRow(r.Context(), `INSERT INTO documents.versions(organisation_id,document_id,version,storage_object_key,content_type,size_bytes,checksum_sha256,uploaded_by,original_filename) VALUES($1,$2,1,$3,$4,$5,$6,$7,$8) RETURNING id`, ac.OrganisationID, documentID, objectKey, in.ContentType, in.SizeBytes, in.ChecksumSHA256, ac.UserID, in.Name).Scan(&versionID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentAccess(r.Context(), tx, ac, documentID, versionID, "upload_url_created"); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", documentID, "document.created", nil, map[string]any{"name": in.Name, "ownerEntityType": in.OwnerEntityType, "ownerEntityId": in.OwnerEntityID, "versionId": versionID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.upload_requested", map[string]any{"documentId": documentID, "versionId": versionID}); err != nil {
		dbProblem(w, err)
		return
	}
	signed, err := a.storage.GetSignedUploadURL(r.Context(), objectKey, in.ContentType, 10*time.Minute)
	if err != nil {
		problem(w, 500, "signing_failed", err.Error())
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]any{"documentId": documentID, "versionId": versionID, "uploadUrl": signed.URL, "method": signed.Method, "headers": signed.Headers, "expiresInSeconds": 600, "storageProvider": a.storage.Name()})
}
func (a *app) createDocumentDownload(w http.ResponseWriter, r *http.Request, ac actor) {
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
	var versionID, key string
	err = tx.QueryRow(r.Context(), `SELECT v.id,v.storage_object_key FROM documents.documents d JOIN documents.versions v ON v.document_id=d.id WHERE d.id=$1 AND d.organisation_id=$2 AND d.deleted_at IS NULL ORDER BY v.version DESC LIMIT 1`, r.PathValue("id"), ac.OrganisationID).Scan(&versionID, &key)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentAccess(r.Context(), tx, ac, r.PathValue("id"), versionID, "download_url_created"); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", r.PathValue("id"), "document.downloaded", nil, map[string]string{"versionId": versionID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.downloaded", map[string]string{"documentId": r.PathValue("id"), "versionId": versionID}); err != nil {
		dbProblem(w, err)
		return
	}
	signedURL, err := a.storage.GetSignedURL(r.Context(), key, 5*time.Minute)
	if err != nil {
		problem(w, 500, "signing_failed", err.Error())
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"downloadUrl": signedURL, "expiresInSeconds": 300, "storageProvider": a.storage.Name()})
}
func (a *app) createDocumentVersionUpload(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Name, ContentType, ChecksumSHA256 string
		SizeBytes                         int64
	}
	if !decode(w, r, &in) {
		return
	}
	if err := validateDocumentFile(in.Name, in.ContentType, in.ChecksumSHA256, in.SizeBytes); err != nil {
		problem(w, 422, "validation_error", err.Error())
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var lockedID string
	err = tx.QueryRow(r.Context(), `SELECT id FROM documents.documents WHERE id=$1 AND organisation_id=$2 AND deleted_at IS NULL FOR UPDATE`, r.PathValue("id"), ac.OrganisationID).Scan(&lockedID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	var version int
	err = tx.QueryRow(r.Context(), `SELECT coalesce(max(version),0)+1 FROM documents.versions WHERE document_id=$1 AND organisation_id=$2`, lockedID, ac.OrganisationID).Scan(&version)
	if err != nil {
		dbProblem(w, err)
		return
	}
	objectKey := strings.Join([]string{ac.OrganisationID, "document", r.PathValue("id"), fmt.Sprintf("%d-%s", version, safeObjectName(in.Name))}, "/")
	var versionID string
	err = tx.QueryRow(r.Context(), `INSERT INTO documents.versions(organisation_id,document_id,version,storage_object_key,content_type,size_bytes,checksum_sha256,uploaded_by,original_filename) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, ac.OrganisationID, r.PathValue("id"), version, objectKey, in.ContentType, in.SizeBytes, in.ChecksumSHA256, ac.UserID, in.Name).Scan(&versionID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentAccess(r.Context(), tx, ac, r.PathValue("id"), versionID, "version_upload_url_created"); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", r.PathValue("id"), "document.version_created", nil, map[string]any{"version": version, "versionId": versionID}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.version_upload_requested", map[string]any{"documentId": r.PathValue("id"), "versionId": versionID, "version": version}); err != nil {
		dbProblem(w, err)
		return
	}
	signed, err := a.storage.GetSignedUploadURL(r.Context(), objectKey, in.ContentType, 10*time.Minute)
	if err != nil {
		problem(w, 500, "signing_failed", err.Error())
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"documentId": r.PathValue("id"), "versionId": versionID, "version": version, "uploadUrl": signed.URL, "method": signed.Method, "headers": signed.Headers, "expiresInSeconds": 600})
}
func (a *app) listDocuments(w http.ResponseWriter, r *http.Request, ac actor) {
	ownerType, ownerID := r.URL.Query().Get("ownerEntityType"), r.URL.Query().Get("ownerEntityId")
	if ownerType == "" || ownerID == "" {
		problem(w, 422, "validation_error", "ownerEntityType and ownerEntityId are required")
		return
	}
	if !ac.Permissions["documents.manage"] && !ac.Permissions["employee.view"] && ownerType == "employee" {
		var own string
		if err := a.db.QueryRow(r.Context(), `SELECT id FROM people.employees WHERE organisation_id=$1 AND user_id=$2 AND deleted_at IS NULL`, ac.OrganisationID, ac.UserID).Scan(&own); err != nil || own != ownerID {
			problem(w, 403, "forbidden", "employees may only view their own document library")
			return
		}
	}
	rows, err := a.db.Query(r.Context(), `SELECT d.id,d.name,d.owner_entity_type AS "ownerEntityType",d.owner_entity_id AS "ownerEntityId",
		d.category_id AS "categoryId",d.created_at AS "createdAt",v.id AS "versionId",v.version,v.content_type AS "contentType",v.size_bytes AS "sizeBytes"
		FROM documents.documents d JOIN LATERAL(SELECT * FROM documents.versions WHERE document_id=d.id ORDER BY version DESC LIMIT 1)v ON true
		WHERE d.organisation_id=$1 AND d.owner_entity_type=$2 AND d.owner_entity_id=$3 AND d.deleted_at IS NULL ORDER BY d.created_at DESC`,
		ac.OrganisationID, ownerType, ownerID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) deleteDocument(w http.ResponseWriter, r *http.Request, ac actor) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var key, versionID string
	err = tx.QueryRow(r.Context(), `SELECT v.storage_object_key,v.id FROM documents.documents d JOIN documents.versions v ON v.document_id=d.id WHERE d.id=$1 AND d.organisation_id=$2 AND d.deleted_at IS NULL ORDER BY v.version DESC LIMIT 1 FOR UPDATE`, r.PathValue("id"), ac.OrganisationID).Scan(&key, &versionID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE documents.documents SET deleted_at=now(),status='archived' WHERE id=$1 AND organisation_id=$2`, r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentAccess(r.Context(), tx, ac, r.PathValue("id"), versionID, "deleted"); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "document", r.PathValue("id"), "document.deleted", nil, map[string]any{"objectKey": key}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.documentOutbox(r.Context(), tx, ac, "document.archived", map[string]any{"documentId": r.PathValue("id")}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (a *app) documentAccess(ctx context.Context, tx pgx.Tx, ac actor, documentID, versionID, action string) error {
	_, err := tx.Exec(ctx, `INSERT INTO documents.access_logs(organisation_id,document_id,version_id,actor_user_id,action,ip_address,request_id) VALUES($1,$2,$3,$4,$5,nullif($6,'')::inet,$7)`, ac.OrganisationID, documentID, versionID, ac.UserID, action, ac.IP, ac.RequestID)
	return err
}

func (a *app) createWorkflowDefinition(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		Key, Name     string
		Specification map[string]any
		Publish       bool
		Transitions   []struct {
			FromState, ToState string
			Condition          map[string]any
		}
	}
	if !decode(w, r, &in) {
		return
	}
	if in.Key == "" || in.Name == "" || len(in.Specification) == 0 {
		problem(w, 422, "validation_error", "key, name and specification are required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id, versionID string
	err = tx.QueryRow(r.Context(), `INSERT INTO workflow.definitions(organisation_id,key,name) VALUES($1,$2,$3) RETURNING id`, ac.OrganisationID, in.Key, in.Name).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	err = tx.QueryRow(r.Context(), `INSERT INTO workflow.versions(organisation_id,definition_id,version,specification,published_at) VALUES($1,$2,1,$3,CASE WHEN $4 THEN now() END) RETURNING id`, ac.OrganisationID, id, in.Specification, in.Publish).Scan(&versionID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	for _, transition := range in.Transitions {
		if transition.FromState == "" || transition.ToState == "" {
			problem(w, 422, "validation_error", "workflow transitions require fromState and toState")
			return
		}
		_, err = tx.Exec(r.Context(), `INSERT INTO workflow.transitions(organisation_id,version_id,from_state,to_state,condition) VALUES($1,$2,$3,$4,$5)`, ac.OrganisationID, versionID, transition.FromState, transition.ToState, transition.Condition)
		if err != nil {
			dbProblem(w, err)
			return
		}
	}
	if err = a.audit(r.Context(), tx, ac, "workflow_definition", id, "workflow.definition_created", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id, "versionId": versionID})
}
func (a *app) startWorkflow(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct{ VersionID, EntityType, EntityID, InitialState string }
	if !decode(w, r, &in) {
		return
	}
	if in.VersionID == "" || in.EntityType == "" || in.EntityID == "" || in.InitialState == "" {
		problem(w, 422, "validation_error", "versionId, entityType, entityId and initialState are required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO workflow.instances(organisation_id,version_id,entity_type,entity_id,state) SELECT $1,id,$3,$4,$5 FROM workflow.versions WHERE id=$2 AND organisation_id=$1 AND published_at IS NOT NULL RETURNING id`, ac.OrganisationID, in.VersionID, in.EntityType, in.EntityID, in.InitialState).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO workflow.history(organisation_id,instance_id,to_state,actor_user_id,payload) VALUES($1,$2,$3,$4,'{}')`, ac.OrganisationID, id, in.InitialState, ac.UserID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "workflow_instance", id, "workflow.started", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 201, map[string]string{"id": id})
}
func (a *app) transitionWorkflow(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		ToState string
		Payload map[string]any
	}
	if !decode(w, r, &in) {
		return
	}
	if in.ToState == "" {
		problem(w, 422, "validation_error", "toState is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var fromState, versionID string
	err = tx.QueryRow(r.Context(), `SELECT state,version_id FROM workflow.instances WHERE id=$1 AND organisation_id=$2 AND completed_at IS NULL FOR UPDATE`, r.PathValue("id"), ac.OrganisationID).Scan(&fromState, &versionID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	var allowed bool
	err = tx.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM workflow.transitions WHERE organisation_id=$1 AND version_id=$2 AND from_state=$3 AND to_state=$4)`, ac.OrganisationID, versionID, fromState, in.ToState).Scan(&allowed)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if !allowed {
		problem(w, 409, "invalid_transition", "transition is not allowed by the published workflow version")
		return
	}
	_, err = tx.Exec(r.Context(), `UPDATE workflow.instances SET state=$3 WHERE id=$1 AND organisation_id=$2`, r.PathValue("id"), ac.OrganisationID, in.ToState)
	if err != nil {
		dbProblem(w, err)
		return
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO workflow.history(organisation_id,instance_id,from_state,to_state,actor_user_id,payload) VALUES($1,$2,$3,$4,$5,$6)`, ac.OrganisationID, r.PathValue("id"), fromState, in.ToState, ac.UserID, in.Payload)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "workflow_instance", r.PathValue("id"), "workflow.transitioned", map[string]string{"state": fromState}, map[string]string{"state": in.ToState}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (a *app) createWorkflowTask(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		TaskKey        string     `json:"taskKey"`
		AssigneeUserID *string    `json:"assigneeUserId"`
		DueAt          *time.Time `json:"dueAt"`
	}
	if !decode(w, r, &in) {
		return
	}
	if in.TaskKey == "" {
		problem(w, 422, "validation_error", "taskKey is required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO workflow.tasks(organisation_id,instance_id,task_key,assignee_user_id,status,due_at) SELECT $1,id,$3,$4,'pending',$5 FROM workflow.instances WHERE id=$2 AND organisation_id=$1 AND completed_at IS NULL RETURNING id`, ac.OrganisationID, r.PathValue("id"), in.TaskKey, in.AssigneeUserID, in.DueAt).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "workflow_task", id, "workflow.task_created", nil, in); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}
func (a *app) completeWorkflowTask(w http.ResponseWriter, r *http.Request, ac actor) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `UPDATE workflow.tasks SET status='completed',completed_at=now() WHERE id=$1 AND organisation_id=$2 AND status<>'completed'`, r.PathValue("id"), ac.OrganisationID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if tag.RowsAffected() != 1 {
		problem(w, 404, "not_found", "open workflow task not found")
		return
	}
	if err = a.audit(r.Context(), tx, ac, "workflow_task", r.PathValue("id"), "workflow.task_completed", nil, map[string]string{"status": "completed"}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (a *app) enqueueNotification(w http.ResponseWriter, r *http.Request, ac actor) {
	var in struct {
		RecipientUserID, TemplateKey string
		Payload                      map[string]any
		Channels                     []string
	}
	if !decode(w, r, &in) {
		return
	}
	if in.RecipientUserID == "" || in.TemplateKey == "" || len(in.Channels) == 0 {
		problem(w, 422, "validation_error", "recipientUserId, templateKey and channels are required")
		return
	}
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	var id string
	err = tx.QueryRow(r.Context(), `INSERT INTO notifications.notifications(organisation_id,recipient_user_id,template_key,payload) VALUES($1,$2,$3,$4) RETURNING id`, ac.OrganisationID, in.RecipientUserID, in.TemplateKey, in.Payload).Scan(&id)
	if err != nil {
		dbProblem(w, err)
		return
	}
	for _, channel := range in.Channels {
		if channel != "email" && channel != "in_app" {
			problem(w, 422, "invalid_channel", "only email and in_app are supported")
			return
		}
		_, err = tx.Exec(r.Context(), `INSERT INTO notifications.deliveries(organisation_id,notification_id,channel,status) VALUES($1,$2,$3,'pending')`, ac.OrganisationID, id, channel)
		if err != nil {
			dbProblem(w, err)
			return
		}
	}
	_, err = tx.Exec(r.Context(), `INSERT INTO notifications.outbox(organisation_id,topic,payload) VALUES($1,'notification.created',$2)`, ac.OrganisationID, map[string]any{"notificationId": id})
	if err != nil {
		dbProblem(w, err)
		return
	}
	if err = a.audit(r.Context(), tx, ac, "notification", id, "notification.enqueued", nil, map[string]any{"templateKey": in.TemplateKey, "channels": in.Channels}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	writeJSON(w, 202, map[string]string{"id": id, "status": "pending"})
}
func (a *app) listMyNotifications(w http.ResponseWriter, r *http.Request, ac actor) {
	rows, err := a.db.Query(r.Context(), `SELECT id,template_key AS "templateKey",payload,created_at AS "createdAt",read_at AS "readAt" FROM notifications.notifications WHERE organisation_id=$1 AND recipient_user_id=$2 ORDER BY created_at DESC LIMIT 100`, ac.OrganisationID, ac.UserID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer rows.Close()
	writeRows(w, rows)
}
func (a *app) readNotification(w http.ResponseWriter, r *http.Request, ac actor) {
	tx, err := a.db.Begin(r.Context())
	if err != nil {
		dbProblem(w, err)
		return
	}
	defer tx.Rollback(r.Context())
	tag, err := tx.Exec(r.Context(), `UPDATE notifications.notifications SET read_at=coalesce(read_at,now()) WHERE id=$1 AND organisation_id=$2 AND recipient_user_id=$3`, r.PathValue("id"), ac.OrganisationID, ac.UserID)
	if err != nil {
		dbProblem(w, err)
		return
	}
	if tag.RowsAffected() != 1 {
		problem(w, 404, "not_found", "notification not found")
		return
	}
	if err = a.audit(r.Context(), tx, ac, "notification", r.PathValue("id"), "notification.read", nil, map[string]bool{"read": true}); err != nil {
		dbProblem(w, err)
		return
	}
	if err = tx.Commit(r.Context()); err != nil {
		dbProblem(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func safeObjectName(name string) string {
	sum := sha256.Sum256([]byte(name + time.Now().UTC().String()))
	ext := ""
	if i := strings.LastIndex(name, "."); i >= 0 && len(name)-i <= 10 {
		ext = strings.ToLower(name[i:])
	}
	return hex.EncodeToString(sum[:8]) + ext
}
