package main

import (
	"testing"
)

func TestPlatformRepositorySaveAndListWorkflows(t *testing.T) {
	repo := NewMemoryPlatformRepository()
	orgID := "org_test"

	wf := &WorkflowDefinition{
		OrganisationID: orgID,
		Name:           "Promotion Approval Chain",
		TriggerEvent:   "promotion_submitted",
		IsActive:       true,
	}

	if err := repo.SaveWorkflow(wf); err != nil {
		t.Fatalf("failed to save workflow: %v", err)
	}

	workflows := repo.ListWorkflows(orgID)
	if len(workflows) != 1 {
		t.Fatalf("expected 1 workflow, got %d", len(workflows))
	}

	if workflows[0].Name != "Promotion Approval Chain" {
		t.Errorf("expected name 'Promotion Approval Chain', got '%s'", workflows[0].Name)
	}
}

func TestAIOrchestratorExecutiveSummary(t *testing.T) {
	ai := NewAIOrchestrator()
	summary := ai.GenerateExecutiveSummary("org_test")

	score, ok := summary["org_health_score"].(float64)
	if !ok || score < 90.0 {
		t.Errorf("expected health score > 90.0, got %v", summary["org_health_score"])
	}
}
