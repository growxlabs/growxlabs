package main

import "time"

type PayrollCycle struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	Name           string    `json:"name"`
	CycleType      string    `json:"cycle_type"` // monthly, weekly, biweekly, custom
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	PaymentDate    time.Time `json:"payment_date"`
	Status         string    `json:"status"` // draft, processing, approved, locked, paid
	CreatedAt      time.Time `json:"created_at"`
}

type EmployeeCompensation struct {
	ID               string    `json:"id"`
	OrganisationID   string    `json:"organisation_id"`
	EmployeeID       string    `json:"employee_id"`
	Version          int       `json:"version"`
	EffectiveDate    time.Time `json:"effective_date"`
	CTCAnnual        float64   `json:"ctc_annual"`
	BasicMonthly     float64   `json:"basic_monthly"`
	HRAMonthly       float64   `json:"hra_monthly"`
	SpecialAllowance float64   `json:"special_allowance"`
	CreatedAt        time.Time `json:"created_at"`
}

type PayrollRun struct {
	ID              string    `json:"id"`
	PayrollCycleID  string    `json:"payroll_cycle_id"`
	OrganisationID  string    `json:"organisation_id"`
	TotalGross      float64   `json:"total_gross"`
	TotalDeductions float64   `json:"total_deductions"`
	TotalNet        float64   `json:"total_net"`
	EmployeeCount   int       `json:"employee_count"`
	Status          string    `json:"status"` // processing, approved, locked, paid
	ApprovedByID    string    `json:"approved_by_id,omitempty"`
	ProcessedAt     time.Time `json:"processed_at"`
}

type Payslip struct {
	ID             string    `json:"id"`
	PayrollRunID   string    `json:"payroll_run_id"`
	EmployeeID     string    `json:"employee_id"`
	GrossPay       float64   `json:"gross_pay"`
	NetPay         float64   `json:"net_pay"`
	EarningsJSON   string    `json:"earnings_json"`
	DeductionsJSON string    `json:"deductions_json"`
	DocumentURL    string    `json:"document_url,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

type ReimbursementClaim struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	EmployeeID     string    `json:"employee_id"`
	Category       string    `json:"category"` // expense, travel, medical, internet, food, fuel
	Amount         float64   `json:"amount"`
	ReceiptURL     string    `json:"receipt_url,omitempty"`
	Status         string    `json:"status"` // pending, manager_approved, finance_approved, paid
	SubmittedAt    time.Time `json:"submitted_at"`
}

type EmployeeLoan struct {
	ID                 string    `json:"id"`
	OrganisationID     string    `json:"organisation_id"`
	EmployeeID         string    `json:"employee_id"`
	LoanType           string    `json:"loan_type"` // loan, advance
	PrincipalAmount    float64   `json:"principal_amount"`
	InterestRate       float64   `json:"interest_rate"`
	TenureMonths       int       `json:"tenure_months"`
	EMIAmount          float64   `json:"emi_amount"`
	OutstandingBalance float64   `json:"outstanding_balance"`
	Status             string    `json:"status"` // active, closed, defaulted
	CreatedAt          time.Time `json:"created_at"`
}
