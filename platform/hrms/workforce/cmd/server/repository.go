package main

import (
	"fmt"
	"sync"
	"time"
)

type MemoryRepository struct {
	mu       sync.RWMutex
	plans    map[string]*WorkforcePlan
	tickets  map[string]*HelpdeskTicket
	travels  map[string]*TravelRequest
	visitors map[string]*VisitorLog
	policies map[string]*Policy
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		plans:    make(map[string]*WorkforcePlan),
		tickets:  make(map[string]*HelpdeskTicket),
		travels:  make(map[string]*TravelRequest),
		visitors: make(map[string]*VisitorLog),
		policies: make(map[string]*Policy),
	}
}

func (r *MemoryRepository) SaveTicket(t *HelpdeskTicket) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if t.ID == "" {
		t.ID = fmt.Sprintf("tkt_%d", time.Now().UnixNano())
	}
	t.CreatedAt = time.Now().UTC()
	r.tickets[t.ID] = t
	return nil
}

func (r *MemoryRepository) ListTickets(orgID, empID string) []*HelpdeskTicket {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var res []*HelpdeskTicket
	for _, t := range r.tickets {
		if t.OrganisationID == orgID && (empID == "" || t.EmployeeID == empID) {
			res = append(res, t)
		}
	}
	return res
}

func (r *MemoryRepository) SaveTravel(tr *TravelRequest) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if tr.ID == "" {
		tr.ID = fmt.Sprintf("trv_%d", time.Now().UnixNano())
	}
	tr.CreatedAt = time.Now().UTC()
	r.travels[tr.ID] = tr
	return nil
}

func (r *MemoryRepository) ListTravels(orgID, empID string) []*TravelRequest {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var res []*TravelRequest
	for _, tr := range r.travels {
		if tr.OrganisationID == orgID && (empID == "" || tr.EmployeeID == empID) {
			res = append(res, tr)
		}
	}
	return res
}

func (r *MemoryRepository) SaveVisitor(v *VisitorLog) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if v.ID == "" {
		v.ID = fmt.Sprintf("vis_%d", time.Now().UnixNano())
	}
	v.CreatedAt = time.Now().UTC()
	r.visitors[v.ID] = v
	return nil
}

func (r *MemoryRepository) ListVisitors(orgID string) []*VisitorLog {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var res []*VisitorLog
	for _, v := range r.visitors {
		if v.OrganisationID == orgID {
			res = append(res, v)
		}
	}
	return res
}
