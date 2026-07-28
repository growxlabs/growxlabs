package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"html"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type worker struct {
	db                 *pgxpool.Pool
	peopleURL, actorID string
	client             *http.Client
}
type certificate struct{ ID, OrganisationID, EmployeeID, VerificationID, CourseTitle, EmployeeName string }

func main() {
	ctx := context.Background()
	db, err := pgxpool.New(ctx, must("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	w := worker{db: db, peopleURL: strings.TrimRight(env("PEOPLE_SERVICE_URL", "http://localhost:8081"), "/"), actorID: must("LEARNING_SERVICE_ACTOR_ID"), client: &http.Client{Timeout: 30 * time.Second}}
	if err = w.run(ctx, positive(env("CERTIFICATE_WORKER_BATCH", "25"))); err != nil {
		log.Fatal(err)
	}
}
func (w worker) run(ctx context.Context, limit int) error {
	rows, err := w.db.Query(ctx, `SELECT c.id,c.organisation_id,c.employee_id,c.verification_id,x.title,concat_ws(' ',e.first_name,e.last_name)FROM learning.certificates c JOIN learning.courses x ON x.id=c.course_id JOIN people.employees e ON e.id=c.employee_id WHERE c.document_id IS NULL AND c.status='ISSUED' ORDER BY c.issued_at LIMIT $1`, limit)
	if err != nil {
		return err
	}
	defer rows.Close()
	items := []certificate{}
	for rows.Next() {
		var item certificate
		if err = rows.Scan(&item.ID, &item.OrganisationID, &item.EmployeeID, &item.VerificationID, &item.CourseTitle, &item.EmployeeName); err != nil {
			return err
		}
		items = append(items, item)
	}
	for _, item := range items {
		if err = w.generate(ctx, item); err != nil {
			log.Printf("certificate %s: %v", item.ID, err)
		}
	}
	return rows.Err()
}
func (w worker) generate(ctx context.Context, item certificate) error {
	content := []byte(fmt.Sprintf(`<!doctype html><html><body><h1>Certificate of Completion</h1><p>This certifies that <strong>%s</strong> completed <strong>%s</strong>.</p><p>Verification ID: %s</p></body></html>`, html.EscapeString(item.EmployeeName), html.EscapeString(item.CourseTitle), html.EscapeString(item.VerificationID)))
	sum := sha256.Sum256(content)
	payload, _ := json.Marshal(map[string]any{"ownerEntityType": "employee", "ownerEntityId": item.EmployeeID, "name": "certificate-" + item.VerificationID + ".html", "contentType": "text/html", "sizeBytes": len(content), "checksumSHA256": hex.EncodeToString(sum[:]), "metadata": map[string]any{"certificateId": item.ID, "verificationId": item.VerificationID}})
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, w.peopleURL+"/documents/upload-url", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	headers(request, item, "documents.manage", w.actorID)
	response, err := w.client.Do(request)
	if err != nil {
		return err
	}
	body, readErr := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	response.Body.Close()
	if readErr != nil {
		return readErr
	}
	if response.StatusCode >= 300 {
		return fmt.Errorf("document service returned %d: %s", response.StatusCode, body)
	}
	var signed struct {
		DocumentID, VersionID, UploadURL, Method string
		Headers                                  map[string]string
	}
	if err = json.Unmarshal(body, &signed); err != nil {
		return err
	}
	upload, err := http.NewRequestWithContext(ctx, signed.Method, signed.UploadURL, bytes.NewReader(content))
	if err != nil {
		return err
	}
	for key, value := range signed.Headers {
		upload.Header.Set(key, value)
	}
	uploaded, err := w.client.Do(upload)
	if err != nil {
		return err
	}
	io.Copy(io.Discard, uploaded.Body)
	uploaded.Body.Close()
	if uploaded.StatusCode >= 300 {
		return fmt.Errorf("storage upload returned %d", uploaded.StatusCode)
	}
	complete, err := http.NewRequestWithContext(ctx, http.MethodPost, w.peopleURL+"/documents/"+signed.DocumentID+"/uploads/"+signed.VersionID+"/complete", bytes.NewReader([]byte(`{}`)))
	if err != nil {
		return err
	}
	headers(complete, item, "documents.manage", w.actorID)
	completed, err := w.client.Do(complete)
	if err != nil {
		return err
	}
	io.Copy(io.Discard, completed.Body)
	completed.Body.Close()
	if completed.StatusCode >= 300 {
		return fmt.Errorf("upload confirmation returned %d", completed.StatusCode)
	}
	tx, err := w.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	tag, err := tx.Exec(ctx, `UPDATE learning.certificates SET document_id=$2 WHERE id=$1 AND organisation_id=$3 AND document_id IS NULL`, item.ID, signed.DocumentID, item.OrganisationID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return nil
	}
	requestID := "00000000-0000-0000-0000-000000000005"
	_, err = tx.Exec(ctx, `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,request_id)VALUES($1,$2,'learning_certificate',$3,'learning.certificate_document_generated',$4,$5);INSERT INTO learning.outbox(organisation_id,topic,payload)VALUES($1,'learning.certificate_issued',$4)`, item.OrganisationID, w.actorID, item.ID, map[string]any{"certificateId": item.ID, "employeeId": item.EmployeeID, "documentId": signed.DocumentID, "verificationId": item.VerificationID}, requestID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func headers(r *http.Request, item certificate, permission, actor string) {
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("X-Actor-Id", actor)
	r.Header.Set("X-Organisation-Id", item.OrganisationID)
	r.Header.Set("X-Request-Id", "00000000-0000-0000-0000-000000000005")
	r.Header.Set("X-Permissions", permission)
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
