package repository

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/commandcenter/phase4/servicekit"
	"time"
)

type Scope struct{ OrganisationID, WorkspaceID string }
type Invoice struct {
	ID         string     `json:"id"`
	Amount     string     `json:"amount"`
	BalanceDue string     `json:"balanceDue"`
	Status     string     `json:"status"`
	DueDate    *time.Time `json:"dueDate,omitempty"`
	CreatedAt  time.Time  `json:"createdAt"`
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
func (p *Postgres) List(ctx context.Context, scope Scope, limit int) ([]Invoice, error) {
	rows, err := p.pool.Query(ctx, `SELECT id::text,amount::text,balance_due::text,status,due_date,created_at FROM public.invoices WHERE organisation_id=$1 AND workspace_id=$2 ORDER BY created_at DESC LIMIT $3`, scope.OrganisationID, scope.WorkspaceID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Invoice{}
	for rows.Next() {
		var item Invoice
		if err = rows.Scan(&item.ID, &item.Amount, &item.BalanceDue, &item.Status, &item.DueDate, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
func (p *Postgres) CreateDraft(ctx context.Context, scope Scope, amount, balance, idempotencyKey string) (Invoice, bool, error) {
	var item Invoice
	err := p.pool.QueryRow(ctx, `INSERT INTO public.invoices(organisation_id,workspace_id,amount,balance_due,status,idempotency_key) VALUES($1,$2,$3::numeric,$4::numeric,'draft',$5) ON CONFLICT(organisation_id,workspace_id,idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING RETURNING id::text,amount::text,balance_due::text,status,due_date,created_at`, scope.OrganisationID, scope.WorkspaceID, amount, balance, idempotencyKey).Scan(&item.ID, &item.Amount, &item.BalanceDue, &item.Status, &item.DueDate, &item.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		err = p.pool.QueryRow(ctx, `SELECT id::text,amount::text,balance_due::text,status,due_date,created_at FROM public.invoices WHERE organisation_id=$1 AND workspace_id=$2 AND idempotency_key=$3`, scope.OrganisationID, scope.WorkspaceID, idempotencyKey).Scan(&item.ID, &item.Amount, &item.BalanceDue, &item.Status, &item.DueDate, &item.CreatedAt)
		return item, false, err
	}
	return item, true, err
}
