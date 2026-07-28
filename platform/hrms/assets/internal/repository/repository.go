package repository

import (
	"context"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/hrms/assets/internal/domain"
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
func AuditOutbox(ctx context.Context, tx pgx.Tx, a domain.Actor, assetID, action string, previous, next any) error {
	_, err := tx.Exec(ctx, `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,previous_value,new_value,ip_address,request_id)VALUES($1,$2,'asset',$3,$4,$5,$6,nullif($7,'')::inet,$8)`, a.OrganisationID, a.UserID, assetID, action, previous, next, a.IP, a.RequestID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO assets.outbox(organisation_id,topic,payload)VALUES($1,$2,jsonb_build_object('assetId',$3,'actorUserId',$4,'requestId',$5))`, a.OrganisationID, action, assetID, a.UserID, a.RequestID)
	return err
}
func AppendHistory(ctx context.Context, tx pgx.Tx, a domain.Actor, assetID, event string, from, to domain.State, payload any) error {
	_, err := tx.Exec(ctx, `INSERT INTO assets.history(organisation_id,asset_id,event_type,from_state,to_state,actor_user_id,payload,request_id)VALUES($1,$2,$3,$4,$5,$6,$7,$8)`, a.OrganisationID, assetID, event, from, to, a.UserID, payload, a.RequestID)
	return err
}
