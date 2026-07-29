package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"growx/commandcenter/phase4/servicekit"
)

type Scope struct{ OrganisationID, WorkspaceID string }
type Lead struct {
	ID           string    `json:"id"`
	BusinessName string    `json:"businessName"`
	ContactName  string    `json:"contactName,omitempty"`
	Email        string    `json:"email,omitempty"`
	City         string    `json:"city,omitempty"`
	Status       string    `json:"status"`
	LeadScore    int       `json:"leadScore"`
	CreatedAt    time.Time `json:"createdAt"`
}
type CreateLead struct{ BusinessName, ContactName, Email, City string }

type Repository interface {
	Ready(context.Context) error
	SearchLeads(context.Context, Scope, string, int) ([]Lead, error)
	CreateLead(context.Context, Scope, CreateLead) (Lead, bool, error)
	Close()
}

type Postgres struct{ pool *pgxpool.Pool }

func Open(ctx context.Context, databaseURL string) (*Postgres, error) {
	pool, err := servicekit.OpenPostgresPool(ctx, databaseURL)
	if err != nil {
		return nil, err
	}
	return &Postgres{pool: pool}, nil
}
func (p *Postgres) Close()                          { p.pool.Close() }
func (p *Postgres) Ready(ctx context.Context) error { return p.pool.Ping(ctx) }
func (p *Postgres) SearchLeads(ctx context.Context, scope Scope, query string, limit int) ([]Lead, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id::text, COALESCE(business_name,''), COALESCE(name,''),
		       COALESCE(email,''), COALESCE(city,''), COALESCE(status,'new'),
		       COALESCE(lead_score,0), created_at
		FROM public.leads
		WHERE organisation_id=$1 AND workspace_id=$2
		  AND ($3='' OR business_name ILIKE '%'||$3||'%' OR email ILIKE '%'||$3||'%')
		ORDER BY created_at DESC LIMIT $4`, scope.OrganisationID, scope.WorkspaceID, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]Lead, 0)
	for rows.Next() {
		var lead Lead
		if err := rows.Scan(&lead.ID, &lead.BusinessName, &lead.ContactName, &lead.Email, &lead.City, &lead.Status, &lead.LeadScore, &lead.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, lead)
	}
	return result, rows.Err()
}
func (p *Postgres) CreateLead(ctx context.Context, scope Scope, input CreateLead) (Lead, bool, error) {
	var lead Lead
	err := p.pool.QueryRow(ctx, `
		INSERT INTO public.leads (organisation_id,workspace_id,business_name,name,email,city,status)
		VALUES ($1,$2,$3,$4,NULLIF($5,''),$6,'new')
		ON CONFLICT (organisation_id,workspace_id,lower(email))
		WHERE email IS NOT NULL AND organisation_id IS NOT NULL AND workspace_id IS NOT NULL
		DO NOTHING
		RETURNING id::text,business_name,COALESCE(name,''),COALESCE(email,''),
		          COALESCE(city,''),status,COALESCE(lead_score,0),created_at`,
		scope.OrganisationID, scope.WorkspaceID, input.BusinessName, input.ContactName, input.Email, input.City,
	).Scan(&lead.ID, &lead.BusinessName, &lead.ContactName, &lead.Email, &lead.City, &lead.Status, &lead.LeadScore, &lead.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		err = p.pool.QueryRow(ctx, `
			SELECT id::text,business_name,COALESCE(name,''),COALESCE(email,''),
			       COALESCE(city,''),status,COALESCE(lead_score,0),created_at
			FROM public.leads WHERE organisation_id=$1 AND workspace_id=$2 AND lower(email)=lower($3)`,
			scope.OrganisationID, scope.WorkspaceID, input.Email,
		).Scan(&lead.ID, &lead.BusinessName, &lead.ContactName, &lead.Email, &lead.City, &lead.Status, &lead.LeadScore, &lead.CreatedAt)
		return lead, false, err
	}
	return lead, true, err
}
