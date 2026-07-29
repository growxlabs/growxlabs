package audit

import (
	"encoding/json"
	"testing"
	"time"

	"growx/commandcenter/governance/contracts"
)

func event(id string, occurred time.Time) contracts.AuditEvent {
	return contracts.AuditEvent{
		ID: id, Version: "1", EventType: "policy_evaluated", Category: "policy",
		OrganisationID: "o1", Actor: contracts.AuditActor{Type: "service", ID: "policy-service"},
		Action: "policy.evaluate", RequestID: "r1", Outcome: "success", OccurredAt: occurred,
		SafeMetadata: json.RawMessage(`{"safe":true}`),
	}
}
func TestHashChainAndTamperDetection(t *testing.T) {
	now := time.Now()
	first, err := Link(event("one", now), 1, "", now)
	if err != nil {
		t.Fatal(err)
	}
	second, err := Link(event("two", now.Add(time.Second)), 2, first.EventHash, now.Add(time.Second))
	if err != nil {
		t.Fatal(err)
	}
	if err := Verify([]contracts.AuditEvent{second, first}); err != nil {
		t.Fatal(err)
	}
	second.Action = "tampered"
	if err := Verify([]contracts.AuditEvent{first, second}); err == nil {
		t.Fatal("tampering was not detected")
	}
}
