package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type worker struct {
	db              *pgxpool.Pool
	client          *http.Client
	resendKey, from string
}

func main() {
	ctx := context.Background()
	db, err := pgxpool.New(ctx, mustEnv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	w := &worker{db: db, client: &http.Client{Timeout: 15 * time.Second}, resendKey: os.Getenv("RESEND_API_KEY"), from: env("NOTIFICATIONS_FROM", "GrowX People <people@growxlabs.tech>")}
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()
	log.Print("notification worker started")
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err = w.runOne(ctx); err != nil {
				log.Printf("delivery error: %v", err)
			}
		}
	}
}
func (w *worker) runOne(ctx context.Context) error {
	tx, err := w.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var outboxID, orgID, notificationID string
	err = tx.QueryRow(ctx, `SELECT id,organisation_id,payload->>'notificationId' FROM notifications.outbox WHERE published_at IS NULL AND topic='notification.created' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1`).Scan(&outboxID, &orgID, &notificationID)
	if err == pgx.ErrNoRows {
		return nil
	}
	if err != nil {
		return err
	}
	rows, err := tx.Query(ctx, `SELECT d.id,d.channel::text,n.template_key,n.payload,u.email::text FROM notifications.deliveries d JOIN notifications.notifications n ON n.id=d.notification_id JOIN identity.users u ON u.id=n.recipient_user_id AND u.organisation_id=n.organisation_id WHERE d.notification_id=$1 AND d.organisation_id=$2 AND d.status='pending'`, notificationID, orgID)
	if err != nil {
		return err
	}
	defer rows.Close()
	type delivery struct {
		id, channel, template string
		payload               map[string]any
		email                 string
	}
	items := []delivery{}
	for rows.Next() {
		var d delivery
		if err = rows.Scan(&d.id, &d.channel, &d.template, &d.payload, &d.email); err != nil {
			return err
		}
		items = append(items, d)
	}
	if err = rows.Err(); err != nil {
		return err
	}
	for _, d := range items {
		deliveryErr := error(nil)
		providerID := "in-app"
		if d.channel == "email" {
			providerID, deliveryErr = w.sendEmail(ctx, d.email, d.template, d.payload)
		}
		if deliveryErr != nil {
			_, _ = tx.Exec(ctx, `UPDATE notifications.deliveries SET attempts=attempts+1,last_error=$2,status=CASE WHEN attempts>=4 THEN 'failed' ELSE 'pending' END WHERE id=$1`, d.id, deliveryErr.Error())
			continue
		}
		_, err = tx.Exec(ctx, `UPDATE notifications.deliveries SET attempts=attempts+1,status='delivered',provider_message_id=$2,delivered_at=now(),last_error=NULL WHERE id=$1`, d.id, providerID)
		if err != nil {
			return err
		}
	}
	_, err = tx.Exec(ctx, `UPDATE notifications.outbox SET published_at=now(),attempts=attempts+1,last_error=NULL WHERE id=$1`, outboxID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (w *worker) sendEmail(ctx context.Context, to, template string, payload map[string]any) (string, error) {
	if w.resendKey == "" {
		return "", fmt.Errorf("RESEND_API_KEY is not configured")
	}
	body, _ := json.Marshal(map[string]any{"from": w.from, "to": []string{to}, "subject": template, "html": fmt.Sprintf("<p>%v</p>", payload)})
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	request.Header.Set("Authorization", "Bearer "+w.resendKey)
	request.Header.Set("Content-Type", "application/json")
	response, err := w.client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return "", fmt.Errorf("email provider returned %d", response.StatusCode)
	}
	var result struct {
		ID string `json:"id"`
	}
	if err = json.NewDecoder(response.Body).Decode(&result); err != nil {
		return "", err
	}
	return result.ID, nil
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
