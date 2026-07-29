package repository

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/commandcenter/phase4/servicekit"
	"time"
)

type EmployeeSummary struct {
	ID             string    `json:"id"`
	EmployeeNumber string    `json:"employeeNumber"`
	DisplayName    string    `json:"displayName"`
	CreatedAt      time.Time `json:"createdAt"`
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
func (p *Postgres) ListEmployees(ctx context.Context, organisationID, workspaceID string, limit int) ([]EmployeeSummary, error) {
	rows, err := p.pool.Query(ctx, `SELECT id::text,employee_number,COALESCE(NULLIF(preferred_name,''),concat_ws(' ',first_name,last_name)),created_at FROM people.employees WHERE organisation_id=$1::uuid AND ($2='' OR workspace_id=$2::uuid) AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $3`, organisationID, workspaceID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []EmployeeSummary{}
	for rows.Next() {
		var item EmployeeSummary
		if err = rows.Scan(&item.ID, &item.EmployeeNumber, &item.DisplayName, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
