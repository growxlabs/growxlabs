package main

import (
	"testing"
)

func TestMemoryRepositorySaveAndListTickets(t *testing.T) {
	repo := NewMemoryRepository()
	orgID := "org_test"
	empID := "emp_101"

	ticket := &HelpdeskTicket{
		OrganisationID: orgID,
		EmployeeID:     empID,
		Category:       "it",
		Subject:        "VPN Connection Issue",
		Description:    "Unable to connect to internal staging cluster",
		Priority:       "high",
		Status:         "open",
	}

	if err := repo.SaveTicket(ticket); err != nil {
		t.Fatalf("failed to save ticket: %v", err)
	}

	tickets := repo.ListTickets(orgID, empID)
	if len(tickets) != 1 {
		t.Fatalf("expected 1 ticket, got %d", len(tickets))
	}

	if tickets[0].Subject != "VPN Connection Issue" {
		t.Errorf("expected subject 'VPN Connection Issue', got '%s'", tickets[0].Subject)
	}
}

func TestAIWorkforceAssistantTicketClassification(t *testing.T) {
	ai := NewAIWorkforceAssistant()
	res := ai.ClassifyTicket("Need VPN Access", "Requesting corporate VPN credentials")

	cat, ok := res["suggested_category"].(string)
	if !ok || cat != "it" {
		t.Errorf("expected category 'it', got %v", res["suggested_category"])
	}
}
