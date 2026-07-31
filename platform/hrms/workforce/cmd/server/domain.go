package main

import "time"

type WorkforcePlan struct {
	ID              string    `json:"id"`
	OrganisationID  string    `json:"organisation_id"`
	Name            string    `json:"name"`
	FiscalYear      string    `json:"fiscal_year"`
	TargetHeadcount int       `json:"target_headcount"`
	BudgetTotal     float64   `json:"budget_total"`
	Status          string    `json:"status"` // draft, active, approved
	CreatedAt       time.Time `json:"created_at"`
}

type HelpdeskTicket struct {
	ID              string     `json:"id"`
	OrganisationID  string     `json:"organisation_id"`
	EmployeeID      string     `json:"employee_id"`
	Category        string     `json:"category"` // hr, it, finance, facilities
	Subject         string     `json:"subject"`
	Description     string     `json:"description"`
	Priority        string     `json:"priority"` // low, medium, high, urgent
	Status          string     `json:"status"`   // open, in_progress, resolved, closed
	AssignedAgentID string     `json:"assigned_agent_id,omitempty"`
	SLADueAt        *time.Time `json:"sla_due_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

type TravelRequest struct {
	ID              string    `json:"id"`
	OrganisationID  string    `json:"organisation_id"`
	EmployeeID      string    `json:"employee_id"`
	Destination     string    `json:"destination"`
	Purpose         string    `json:"purpose"`
	DepartureDate   time.Time `json:"departure_date"`
	ReturnDate      time.Time `json:"return_date"`
	EstimatedBudget float64   `json:"estimated_budget"`
	Status          string    `json:"status"` // pending, manager_approved, finance_approved, approved, rejected
	CreatedAt       time.Time `json:"created_at"`
}

type VisitorLog struct {
	ID             string     `json:"id"`
	OrganisationID string     `json:"organisation_id"`
	VisitorName    string     `json:"visitor_name"`
	HostEmployeeID string     `json:"host_employee_id"`
	CompanyName    string     `json:"company_name,omitempty"`
	QRPassCode     string     `json:"qr_pass_code"`
	EntryTime      *time.Time `json:"entry_time,omitempty"`
	ExitTime       *time.Time `json:"exit_time,omitempty"`
	Status         string     `json:"status"` // registered, checked_in, checked_out
	CreatedAt      time.Time  `json:"created_at"`
}

type Policy struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	Title          string    `json:"title"`
	Category       string    `json:"category"`
	Version        int       `json:"version"`
	DocumentURL    string    `json:"document_url,omitempty"`
	EffectiveDate  time.Time `json:"effective_date"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}
