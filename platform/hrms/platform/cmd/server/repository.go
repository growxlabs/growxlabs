package main

import (
	"fmt"
	"sync"
	"time"
)

type MemoryPlatformRepository struct {
	mu        sync.RWMutex
	orgs      map[string]*Organization
	workflows map[string]*WorkflowDefinition
	webhooks  map[string]*WebhookSubscription
	reports   map[string]*ReportTemplate
}

func NewMemoryPlatformRepository() *MemoryPlatformRepository {
	return &MemoryPlatformRepository{
		orgs:      make(map[string]*Organization),
		workflows: make(map[string]*WorkflowDefinition),
		webhooks:  make(map[string]*WebhookSubscription),
		reports:   make(map[string]*ReportTemplate),
	}
}

func (r *MemoryPlatformRepository) SaveWorkflow(w *WorkflowDefinition) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if w.ID == "" {
		w.ID = fmt.Sprintf("wf_%d", time.Now().UnixNano())
	}
	w.CreatedAt = time.Now().UTC()
	r.workflows[w.ID] = w
	return nil
}

func (r *MemoryPlatformRepository) ListWorkflows(orgID string) []*WorkflowDefinition {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var res []*WorkflowDefinition
	for _, w := range r.workflows {
		if w.OrganisationID == orgID {
			res = append(res, w)
		}
	}
	return res
}

func (r *MemoryPlatformRepository) SaveWebhook(wh *WebhookSubscription) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if wh.ID == "" {
		wh.ID = fmt.Sprintf("wh_%d", time.Now().UnixNano())
	}
	wh.CreatedAt = time.Now().UTC()
	r.webhooks[wh.ID] = wh
	return nil
}

func (r *MemoryPlatformRepository) ListWebhooks(orgID string) []*WebhookSubscription {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var res []*WebhookSubscription
	for _, wh := range r.webhooks {
		if wh.OrganisationID == orgID {
			res = append(res, wh)
		}
	}
	return res
}
