package audit

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"sort"
	"time"

	"growx/commandcenter/governance/contracts"
)

func Validate(event contracts.AuditEvent) error {
	if event.ID == "" || event.Version == "" || event.EventType == "" || event.OrganisationID == "" ||
		event.Actor.ID == "" || event.RequestID == "" || event.Action == "" {
		return errors.New("audit identity, tenant, actor, request and action are required")
	}
	if !contains([]string{"authentication", "authorisation", "policy", "approval", "execution", "tool", "domain", "administration", "security"}, event.Category) {
		return errors.New("invalid audit category")
	}
	if !contains([]string{"user", "agent", "service", "system"}, event.Actor.Type) {
		return errors.New("invalid audit actor type")
	}
	if !contains([]string{"success", "failure", "denied", "blocked", "expired", "cancelled"}, event.Outcome) {
		return errors.New("invalid audit outcome")
	}
	if event.Sequence < 1 || event.OccurredAt.IsZero() {
		return errors.New("positive sequence and occurred timestamp are required")
	}
	return nil
}

func Hash(event contracts.AuditEvent) (string, error) {
	copy := event
	copy.EventHash, copy.IngestedAt = "", time.Time{}
	payload, err := canonicalJSON(copy)
	if err != nil {
		return "", err
	}
	hash := sha256.Sum256(payload)
	return hex.EncodeToString(hash[:]), nil
}

func Link(event contracts.AuditEvent, sequence int64, previousHash string, ingestedAt time.Time) (contracts.AuditEvent, error) {
	event.Sequence, event.PreviousHash, event.IngestedAt = sequence, previousHash, ingestedAt.UTC()
	if err := Validate(event); err != nil {
		return contracts.AuditEvent{}, err
	}
	hash, err := Hash(event)
	if err != nil {
		return contracts.AuditEvent{}, err
	}
	event.EventHash = hash
	return event, nil
}

func Verify(events []contracts.AuditEvent) error {
	sort.Slice(events, func(i, j int) bool { return events[i].Sequence < events[j].Sequence })
	previous := ""
	for index, event := range events {
		if event.Sequence != int64(index+1) || event.PreviousHash != previous {
			return errors.New("audit sequence or previous hash is invalid")
		}
		hash, err := Hash(event)
		if err != nil || hash != event.EventHash {
			return errors.New("audit event hash is invalid")
		}
		previous = event.EventHash
	}
	return nil
}

func canonicalJSON(value any) ([]byte, error) {
	payload, err := json.Marshal(value)
	if err != nil {
		return nil, err
	}
	var decoded any
	if err := json.Unmarshal(payload, &decoded); err != nil {
		return nil, err
	}
	return json.Marshal(decoded)
}
func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
