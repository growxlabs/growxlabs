package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type worker struct {
	db                                                             *pgxpool.Pool
	client                                                         *http.Client
	peopleURL, assetsURL, learningURL, actorID, documentCategoryID string
}
type event struct{ ID, OrganisationID, InstanceID, EmployeeID string }

func main() {
	ctx := context.Background()
	db, err := pgxpool.New(ctx, must("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	w := worker{db: db, client: &http.Client{Timeout: 20 * time.Second}, peopleURL: strings.TrimRight(env("PEOPLE_SERVICE_URL", "http://localhost:8081"), "/"), assetsURL: strings.TrimRight(env("ASSETS_SERVICE_URL", "http://localhost:8085"), "/"), learningURL: strings.TrimRight(env("LEARNING_SERVICE_URL", "http://localhost:8086"), "/"), actorID: must("ONBOARDING_SERVICE_ACTOR_ID"), documentCategoryID: os.Getenv("ONBOARDING_DOCUMENT_CATEGORY_ID")}
	if err = w.run(ctx, positive(env("RELEASE05_INTEGRATION_BATCH", "25"))); err != nil {
		log.Fatal(err)
	}
}
func (w worker) run(ctx context.Context, limit int) error {
	rows, err := w.db.Query(ctx, `SELECT o.id,o.organisation_id,o.payload->>'instanceId',o.payload->>'employeeId' FROM notifications.outbox o WHERE o.topic='employee.activated' AND NOT EXISTS(SELECT 1 FROM hrms_integration.release05_deliveries d WHERE d.source_outbox_id=o.id AND d.status='COMPLETED') ORDER BY o.created_at LIMIT $1`, limit)
	if err != nil {
		return err
	}
	defer rows.Close()
	events := []event{}
	for rows.Next() {
		var e event
		if err = rows.Scan(&e.ID, &e.OrganisationID, &e.InstanceID, &e.EmployeeID); err != nil {
			return err
		}
		events = append(events, e)
	}
	for _, e := range events {
		if err = w.process(ctx, e); err != nil {
			_, _ = w.db.Exec(ctx, `INSERT INTO hrms_integration.release05_deliveries(source_outbox_id,organisation_id,event_topic,status,attempts,last_error)VALUES($1,$2,'employee.activated','FAILED',1,$3)ON CONFLICT(source_outbox_id)DO UPDATE SET status='FAILED',attempts=hrms_integration.release05_deliveries.attempts+1,last_error=$3`, e.ID, e.OrganisationID, err.Error())
			continue
		}
		_, err = w.db.Exec(ctx, `INSERT INTO hrms_integration.release05_deliveries(source_outbox_id,organisation_id,event_topic,status,attempts,completed_at)VALUES($1,$2,'employee.activated','COMPLETED',1,now())ON CONFLICT(source_outbox_id)DO UPDATE SET status='COMPLETED',attempts=hrms_integration.release05_deliveries.attempts+1,last_error=NULL,completed_at=now()`, e.ID, e.OrganisationID)
		if err != nil {
			return err
		}
	}
	return nil
}
func (w worker) process(ctx context.Context, e event) error {
	if w.documentCategoryID != "" {
		if err := w.post(ctx, e, w.peopleURL+"/documents/requests", "documents.request", map[string]any{"employeeId": e.EmployeeID, "categoryId": w.documentCategoryID, "requestedName": "Required onboarding documents", "instructions": "Upload the required identity and employment documents."}); err != nil {
			return err
		}
	}
	assetRows, err := w.db.Query(ctx, `SELECT r.asset_type,r.specifications,c.id FROM onboarding.asset_requests r JOIN assets.categories c ON c.organisation_id=r.organisation_id AND lower(c.name)=replace(r.asset_type,'_',' ') WHERE r.instance_id=$1 AND r.organisation_id=$2 AND r.status='requested'`, e.InstanceID, e.OrganisationID)
	if err != nil {
		return err
	}
	defer assetRows.Close()
	for assetRows.Next() {
		var kind, category string
		var spec any
		if err = assetRows.Scan(&kind, &spec, &category); err != nil {
			return err
		}
		if err = w.post(ctx, e, w.assetsURL+"/requests/on-behalf", "assets.assign", map[string]any{"employeeId": e.EmployeeID, "categoryId": category, "reason": "Onboarding: " + kind, "specification": spec}); err != nil {
			return err
		}
	}
	learningRows, err := w.db.Query(ctx, `SELECT c.id,t.due_at FROM onboarding.training_assignments t JOIN learning.courses c ON c.organisation_id=t.organisation_id AND c.code=t.training_key AND c.status='PUBLISHED' WHERE t.instance_id=$1 AND t.organisation_id=$2`, e.InstanceID, e.OrganisationID)
	if err != nil {
		return err
	}
	defer learningRows.Close()
	for learningRows.Next() {
		var course string
		var due any
		if err = learningRows.Scan(&course, &due); err != nil {
			return err
		}
		if err = w.post(ctx, e, w.learningURL+"/enrollments", "learning.assign", map[string]any{"employeeId": e.EmployeeID, "courseId": course, "assignmentSource": "ONBOARDING", "sourceId": e.InstanceID, "dueAt": due}); err != nil {
			return err
		}
	}
	return nil
}
func (w worker) post(ctx context.Context, e event, url, permission string, payload any) error {
	body, _ := json.Marshal(payload)
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-Actor-Id", w.actorID)
	request.Header.Set("X-Organisation-Id", e.OrganisationID)
	request.Header.Set("X-Request-Id", e.ID)
	request.Header.Set("X-Permissions", permission)
	response, err := w.client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode >= 300 {
		data, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
		return fmt.Errorf("%s returned %d: %s", url, response.StatusCode, data)
	}
	return nil
}
func env(k, f string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return f
}
func must(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatal(k + " is required")
	}
	return v
}
func positive(v string) int {
	var n int
	_, _ = fmt.Sscan(v, &n)
	if n < 1 {
		return 25
	}
	if n > 100 {
		return 100
	}
	return n
}
