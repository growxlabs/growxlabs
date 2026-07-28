package repository

import (
	"context"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/hrms/learning/internal/domain"
)

type Repository struct{ DB *pgxpool.Pool }

func New(db *pgxpool.Pool) *Repository { return &Repository{DB: db} }
func (r *Repository) Tx(ctx context.Context, fn func(pgx.Tx) error) error {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if err = fn(tx); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func AuditOutbox(ctx context.Context, tx pgx.Tx, a domain.Actor, entity, id, topic string, payload any) error {
	_, err := tx.Exec(ctx, `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,ip_address,request_id)VALUES($1,$2,$3,$4,$5,$6,nullif($7,'')::inet,$8)`, a.OrganisationID, a.UserID, entity, id, topic, payload, a.IP, a.RequestID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO learning.outbox(organisation_id,topic,payload)VALUES($1,$2,$3)`, a.OrganisationID, topic, payload)
	return err
}
func History(ctx context.Context, tx pgx.Tx, a domain.Actor, enrollmentID, event string, payload any) error {
	_, err := tx.Exec(ctx, `INSERT INTO learning.history(organisation_id,enrollment_id,event_type,actor_user_id,payload,request_id)VALUES($1,$2,$3,$4,$5,$6)`, a.OrganisationID, enrollmentID, event, a.UserID, payload, a.RequestID)
	return err
}
