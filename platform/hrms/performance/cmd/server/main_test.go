package main

import (
	"testing"
	"time"
)

func TestMemoryRepositorySaveAndListGoals(t *testing.T) {
	repo := NewMemoryRepository()
	orgID := "org_test"
	empID := "emp_101"

	goal := &Goal{
		OrganisationID: orgID,
		EmployeeID:     empID,
		GoalType:       "okr",
		Title:          "Test OKR Goal",
		Weightage:      20.0,
		Status:         "active",
	}

	if err := repo.SaveGoal(goal); err != nil {
		t.Fatalf("failed to save goal: %v", err)
	}

	goals := repo.ListGoals(orgID, empID)
	if len(goals) != 1 {
		t.Fatalf("expected 1 goal, got %d", len(goals))
	}

	if goals[0].Title != "Test OKR Goal" {
		t.Errorf("expected goal title 'Test OKR Goal', got '%s'", goals[0].Title)
	}
}

func TestAIAssistantCompensationAdvice(t *testing.T) {
	ai := NewAIAssistant()
	advice := ai.RecommendCompensation(4.8)

	rec, ok := advice["advisory_recommendation"].(string)
	if !ok || rec == "" {
		t.Errorf("expected non-empty advisory recommendation, got %v", advice["advisory_recommendation"])
	}

	mandatory, ok := advice["human_approval_mandatory"].(bool)
	if !ok || !mandatory {
		t.Errorf("expected human_approval_mandatory to be true")
	}
}

func TestPerformanceTimelineEvent(t *testing.T) {
	repo := NewMemoryRepository()
	orgID := "org_test"
	empID := "emp_102"

	evt := &PerformanceTimelineEvent{
		OrganisationID: orgID,
		EmployeeID:     empID,
		EventType:      "promotion",
		Title:          "Promoted to Senior Engineer",
		OccurredAt:     time.Now().UTC(),
	}

	if err := repo.AddTimelineEvent(evt); err != nil {
		t.Fatalf("failed to add timeline event: %v", err)
	}

	timeline := repo.GetTimeline(orgID, empID)
	if len(timeline) != 1 {
		t.Fatalf("expected 1 timeline event, got %d", len(timeline))
	}
}
