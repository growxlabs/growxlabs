package repository

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/commandcenter/phase4/servicekit"
	"time"
)

type Campaign struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"`
	Budget    string    `json:"budget"`
	Spent     string    `json:"spent"`
	ROI       string    `json:"roi"`
	CreatedAt time.Time `json:"createdAt"`
}
type Brief struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Objective string    `json:"objective"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}
type Postgres struct{ pool *pgxpool.Pool }

func Open(ctx context.Context, url string) (*Postgres, error) {
	pool, err := servicekit.OpenPostgresPool(ctx, url)
	if err != nil {
		return nil, err
	}
	return &Postgres{pool}, nil
}
func (p *Postgres) Close()                          { p.pool.Close() }
func (p *Postgres) Ready(ctx context.Context) error { return p.pool.Ping(ctx) }
func (p *Postgres) Campaigns(ctx context.Context, organisationID, workspaceID string, limit int) ([]Campaign, error) {
	rows, err := p.pool.Query(ctx, `SELECT id::text,name,status,budget::text,spent::text,roi::text,created_at FROM public.campaigns WHERE organisation_id=$1 AND workspace_id=$2 ORDER BY created_at DESC LIMIT $3`, organisationID, workspaceID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Campaign{}
	for rows.Next() {
		var item Campaign
		if err = rows.Scan(&item.ID, &item.Name, &item.Status, &item.Budget, &item.Spent, &item.ROI, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
func (p *Postgres) CreateBrief(ctx context.Context, organisationID, workspaceID, userID, title, objective, audience, key string) (Brief, bool, error) {
	var item Brief
	err := p.pool.QueryRow(ctx, `INSERT INTO command_marketing.content_briefs(organisation_id,workspace_id,title,objective,audience,created_by,idempotency_key)VALUES($1,$2,$3,$4,$5,$6,$7)ON CONFLICT(organisation_id,workspace_id,idempotency_key)DO NOTHING RETURNING id::text,title,objective,status,created_at`, organisationID, workspaceID, title, objective, audience, userID, key).Scan(&item.ID, &item.Title, &item.Objective, &item.Status, &item.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		err = p.pool.QueryRow(ctx, `SELECT id::text,title,objective,status,created_at FROM command_marketing.content_briefs WHERE organisation_id=$1 AND workspace_id=$2 AND idempotency_key=$3`, organisationID, workspaceID, key).Scan(&item.ID, &item.Title, &item.Objective, &item.Status, &item.CreatedAt)
		return item, false, err
	}
	return item, true, err
}
