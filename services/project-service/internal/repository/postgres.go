package repository

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/commandcenter/phase4/servicekit"
	"time"
)

type Project struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"`
	Progress  int       `json:"progress"`
	Health    string    `json:"health,omitempty"`
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
func (p *Postgres) List(ctx context.Context, organisationID, workspaceID string, limit int) ([]Project, error) {
	rows, err := p.pool.Query(ctx, `SELECT id::text,COALESCE(to_jsonb(p)->>'name',to_jsonb(p)->>'title',''),COALESCE(to_jsonb(p)->>'status','pending'),COALESCE((to_jsonb(p)->>'progress')::int,0),COALESCE(to_jsonb(p)->>'health',''),created_at FROM public.projects p WHERE organisation_id=$1 AND workspace_id=$2 ORDER BY created_at DESC LIMIT $3`, organisationID, workspaceID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Project{}
	for rows.Next() {
		var item Project
		if err = rows.Scan(&item.ID, &item.Name, &item.Status, &item.Progress, &item.Health, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
