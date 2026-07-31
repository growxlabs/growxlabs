package main

import (
	"fmt"
	"sync"
	"time"
)

type MemoryRepository struct {
	mu          sync.RWMutex
	configs     map[string]*PerformanceConfig
	goals       map[string]*Goal
	cycles      map[string]*ReviewCycle
	reviews     map[string]*PerformanceReview
	feedback360 map[string]*Feedback360
	pips        map[string]*PIPPlan
	rewards     map[string]*RewardRecognition
	timelines   map[string][]*PerformanceTimelineEvent
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		configs:     make(map[string]*PerformanceConfig),
		goals:       make(map[string]*Goal),
		cycles:      make(map[string]*ReviewCycle),
		reviews:     make(map[string]*PerformanceReview),
		feedback360: make(map[string]*Feedback360),
		pips:        make(map[string]*PIPPlan),
		rewards:     make(map[string]*RewardRecognition),
		timelines:   make(map[string][]*PerformanceTimelineEvent),
	}
}

func (r *MemoryRepository) SaveConfig(cfg *PerformanceConfig) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	cfg.UpdatedAt = time.Now().UTC()
	r.configs[cfg.OrganisationID] = cfg
	return nil
}

func (r *MemoryRepository) GetConfig(orgID string) (*PerformanceConfig, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	cfg, ok := r.configs[orgID]
	if !ok {
		return &PerformanceConfig{
			OrganisationID:              orgID,
			RatingScaleType:             "5_point",
			CalibrationDistributionType: "nine_box",
		}, nil
	}
	return cfg, nil
}

func (r *MemoryRepository) SaveGoal(goal *Goal) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if goal.ID == "" {
		goal.ID = fmt.Sprintf("goal_%d", time.Now().UnixNano())
	}
	now := time.Now().UTC()
	if goal.CreatedAt.IsZero() {
		goal.CreatedAt = now
	}
	goal.UpdatedAt = now
	r.goals[goal.ID] = goal
	return nil
}

func (r *MemoryRepository) ListGoals(orgID, empID string) []*Goal {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var res []*Goal
	for _, g := range r.goals {
		if g.OrganisationID == orgID && (empID == "" || g.EmployeeID == empID) {
			res = append(res, g)
		}
	}
	return res
}

func (r *MemoryRepository) SaveReview(review *PerformanceReview) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if review.ID == "" {
		review.ID = fmt.Sprintf("rev_%d", time.Now().UnixNano())
	}
	now := time.Now().UTC()
	if review.CreatedAt.IsZero() {
		review.CreatedAt = now
	}
	review.UpdatedAt = now
	r.reviews[review.ID] = review
	return nil
}

func (r *MemoryRepository) ListReviews(orgID, empID string) []*PerformanceReview {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var res []*PerformanceReview
	for _, rev := range r.reviews {
		if rev.OrganisationID == orgID && (empID == "" || rev.EmployeeID == empID) {
			res = append(res, rev)
		}
	}
	return res
}

func (r *MemoryRepository) AddTimelineEvent(evt *PerformanceTimelineEvent) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if evt.ID == "" {
		evt.ID = fmt.Sprintf("evt_%d", time.Now().UnixNano())
	}
	if evt.OccurredAt.IsZero() {
		evt.OccurredAt = time.Now().UTC()
	}
	key := fmt.Sprintf("%s:%s", evt.OrganisationID, evt.EmployeeID)
	r.timelines[key] = append(r.timelines[key], evt)
	return nil
}

func (r *MemoryRepository) GetTimeline(orgID, empID string) []*PerformanceTimelineEvent {
	r.mu.RLock()
	defer r.mu.RUnlock()
	key := fmt.Sprintf("%s:%s", orgID, empID)
	return r.timelines[key]
}
