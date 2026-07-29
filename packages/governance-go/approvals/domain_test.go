package approvals

import (
	"testing"
	"time"

	"growx/commandcenter/governance/contracts"
)

func approval(now time.Time) contracts.ApprovalRequest {
	return contracts.ApprovalRequest{
		ID: "a1", RequestID: "request", OrganisationID: "o1", WorkspaceID: "w1",
		RequestedByUserID: "requester", Status: "pending", MinimumApprovals: 2,
		ProhibitSelfApproval: true, RequireDistinctApprovers: true,
		EligibleRoleIDs: []string{"finance"}, ExpiresAt: now.Add(time.Hour),
	}
}
func approver(id string) ApproverContext {
	return ApproverContext{UserID: id, OrganisationID: "o1", WorkspaceIDs: []string{"w1"}, RoleIDs: []string{"finance"}, Permissions: []string{"governance.approvals.decide"}, Active: true}
}

func TestSelfApprovalAndCrossTenantAreBlocked(t *testing.T) {
	now := time.Now()
	request := approval(now)
	if err := ValidateDecision(request, nil, approver("requester"), "approved", now); err == nil || err.Code != "APPROVAL_SELF_APPROVAL_BLOCKED" {
		t.Fatalf("self approval was not blocked: %#v", err)
	}
	user := approver("other")
	user.OrganisationID = "o2"
	if err := ValidateDecision(request, nil, user, "approved", now); err == nil || err.Code != "APPROVER_NOT_ELIGIBLE" {
		t.Fatalf("cross tenant approval was not blocked: %#v", err)
	}
}

func TestMultiApprovalAndRejection(t *testing.T) {
	request := approval(time.Now())
	one := contracts.ApprovalDecision{ApproverUserID: "one", Decision: "approved"}
	status, _ := DeriveStatus(request, []contracts.ApprovalDecision{one})
	if status != "partially_approved" {
		t.Fatalf("status=%s", status)
	}
	two := contracts.ApprovalDecision{ApproverUserID: "two", Decision: "approved"}
	status, _ = DeriveStatus(request, []contracts.ApprovalDecision{one, two})
	if status != "approved" {
		t.Fatalf("status=%s", status)
	}
	status, _ = DeriveStatus(request, []contracts.ApprovalDecision{one, {ApproverUserID: "two", Decision: "rejected"}})
	if status != "rejected" {
		t.Fatalf("status=%s", status)
	}
}

func TestReferenceRejectsChangedAndExpiredRequests(t *testing.T) {
	now := time.Now()
	request := approval(now)
	request.Status, request.RequestFingerprint = "approved", "fingerprint"
	request.RunID, request.StepID, request.ToolID, request.ToolVersion = "run", "step", "tool", "1"
	reference := ApprovalReference{
		ApprovalRequestID: request.ID, OrganisationID: "o1", WorkspaceID: "w1",
		RunID: "run", StepID: "step", ToolID: "tool", ToolVersion: "1",
		RequestFingerprint: "fingerprint",
	}
	if err := ValidateReference(request, reference, "changed", now); err == nil || err.Code != "APPROVAL_REQUEST_CHANGED" {
		t.Fatalf("changed request accepted: %#v", err)
	}
	request.ExpiresAt = now.Add(-time.Second)
	if err := ValidateReference(request, reference, "fingerprint", now); err == nil || err.Code != "APPROVAL_EXPIRED" {
		t.Fatalf("expired approval accepted: %#v", err)
	}
}
