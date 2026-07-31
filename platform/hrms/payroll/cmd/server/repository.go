package main

import (
	"fmt"
	"sync"
	"time"
)

type MemoryRepository struct {
	mu             sync.RWMutex
	cycles         map[string]*PayrollCycle
	compensations  map[string]*EmployeeCompensation
	runs           map[string]*PayrollRun
	payslips       map[string][]*Payslip
	reimbursements map[string][]*ReimbursementClaim
	loans          map[string][]*EmployeeLoan
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		cycles:         make(map[string]*PayrollCycle),
		compensations:  make(map[string]*EmployeeCompensation),
		runs:           make(map[string]*PayrollRun),
		payslips:       make(map[string][]*Payslip),
		reimbursements: make(map[string][]*ReimbursementClaim),
		loans:          make(map[string][]*EmployeeLoan),
	}
}

func (r *MemoryRepository) SaveCycle(c *PayrollCycle) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if c.ID == "" {
		c.ID = fmt.Sprintf("cyc_%d", time.Now().UnixNano())
	}
	c.CreatedAt = time.Now().UTC()
	r.cycles[c.ID] = c
	return nil
}

func (r *MemoryRepository) SaveCompensation(comp *EmployeeCompensation) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if comp.ID == "" {
		comp.ID = fmt.Sprintf("comp_%d", time.Now().UnixNano())
	}
	comp.CreatedAt = time.Now().UTC()
	key := fmt.Sprintf("%s:%s", comp.OrganisationID, comp.EmployeeID)
	r.compensations[key] = comp
	return nil
}

func (r *MemoryRepository) GetCompensation(orgID, empID string) (*EmployeeCompensation, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	key := fmt.Sprintf("%s:%s", orgID, empID)
	comp, ok := r.compensations[key]
	if !ok {
		return &EmployeeCompensation{
			OrganisationID:   orgID,
			EmployeeID:       empID,
			CTCAnnual:        1200000,
			BasicMonthly:     50000,
			HRAMonthly:       25000,
			SpecialAllowance: 25000,
		}, nil
	}
	return comp, nil
}

func (r *MemoryRepository) SavePayrollRun(run *PayrollRun) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if run.ID == "" {
		run.ID = fmt.Sprintf("run_%d", time.Now().UnixNano())
	}
	run.ProcessedAt = time.Now().UTC()
	r.runs[run.ID] = run
	return nil
}

func (r *MemoryRepository) SavePayslip(p *Payslip) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if p.ID == "" {
		p.ID = fmt.Sprintf("ps_%d", time.Now().UnixNano())
	}
	p.CreatedAt = time.Now().UTC()
	r.payslips[p.PayrollRunID] = append(r.payslips[p.PayrollRunID], p)
	return nil
}

func (r *MemoryRepository) SaveReimbursement(claim *ReimbursementClaim) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if claim.ID == "" {
		claim.ID = fmt.Sprintf("claim_%d", time.Now().UnixNano())
	}
	claim.SubmittedAt = time.Now().UTC()
	key := fmt.Sprintf("%s:%s", claim.OrganisationID, claim.EmployeeID)
	r.reimbursements[key] = append(r.reimbursements[key], claim)
	return nil
}

func (r *MemoryRepository) ListReimbursements(orgID, empID string) []*ReimbursementClaim {
	r.mu.RLock()
	defer r.mu.RUnlock()
	key := fmt.Sprintf("%s:%s", orgID, empID)
	return r.reimbursements[key]
}
