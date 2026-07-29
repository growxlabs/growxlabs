package approvals

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"sort"
	"strings"
	"time"

	"growx/commandcenter/governance/contracts"
)

type ApproverContext struct {
	UserID         string
	OrganisationID string
	WorkspaceIDs   []string
	RoleIDs        []string
	TeamIDs        []string
	Permissions    []string
	Active         bool
}

func Fingerprint(value any) (string, error) {
	payload, err := json.Marshal(value)
	if err != nil {
		return "", err
	}
	hash := sha256.Sum256(payload)
	return hex.EncodeToString(hash[:]), nil
}

func ValidateDecision(request contracts.ApprovalRequest, existing []contracts.ApprovalDecision, approver ApproverContext, decision string, now time.Time) *contracts.ServiceError {
	fail := func(code, message string) *contracts.ServiceError {
		return &contracts.ServiceError{Code: code, Message: message, RequestID: request.RequestID}
	}
	if request.Status != "pending" && request.Status != "partially_approved" {
		return fail("APPROVAL_ALREADY_RESOLVED", "approval request is already resolved")
	}
	if !now.Before(request.ExpiresAt) {
		return fail("APPROVAL_EXPIRED", "approval request has expired")
	}
	if !approver.Active || approver.OrganisationID != request.OrganisationID || !contains(approver.WorkspaceIDs, request.WorkspaceID) {
		return fail("APPROVER_NOT_ELIGIBLE", "approver is not eligible for this tenant scope")
	}
	if !contains(approver.Permissions, "governance.approvals.decide") {
		return fail("APPROVER_NOT_ELIGIBLE", "approval decision permission is required")
	}
	if request.ProhibitSelfApproval && approver.UserID == request.RequestedByUserID {
		return fail("APPROVAL_SELF_APPROVAL_BLOCKED", "requesters cannot approve their own operation")
	}
	if len(request.EligibleRoleIDs) > 0 && !intersects(request.EligibleRoleIDs, approver.RoleIDs) {
		return fail("APPROVER_NOT_ELIGIBLE", "an eligible approver role is required")
	}
	if len(request.EligibleTeamIDs) > 0 && !intersects(request.EligibleTeamIDs, approver.TeamIDs) {
		return fail("APPROVER_NOT_ELIGIBLE", "an eligible approver team is required")
	}
	for _, existingDecision := range existing {
		if existingDecision.ApproverUserID == approver.UserID {
			return fail("APPROVAL_ALREADY_RESOLVED", "this approver already submitted a decision")
		}
	}
	if decision != "approved" && decision != "rejected" {
		return fail("APPROVAL_FORBIDDEN", "approval decision must be approved or rejected")
	}
	return nil
}

func DeriveStatus(request contracts.ApprovalRequest, decisions []contracts.ApprovalDecision) (string, error) {
	if request.MinimumApprovals < 1 {
		return "", errors.New("minimum approvals must be positive")
	}
	distinct := map[string]bool{}
	approved := 0
	for _, decision := range decisions {
		if decision.Decision == "rejected" {
			return "rejected", nil
		}
		if decision.Decision == "approved" && (!request.RequireDistinctApprovers || !distinct[decision.ApproverUserID]) {
			distinct[decision.ApproverUserID] = true
			approved++
		}
	}
	if approved >= request.MinimumApprovals {
		return "approved", nil
	}
	if approved > 0 {
		return "partially_approved", nil
	}
	return "pending", nil
}

type ApprovalReference struct {
	ApprovalRequestID  string
	OrganisationID     string
	WorkspaceID        string
	RunID              string
	StepID             string
	CapabilityID       string
	SkillID            string
	ToolID             string
	ToolVersion        string
	Operation          string
	PolicyDecisionID   string
	RequestFingerprint string
}

func ValidateReference(request contracts.ApprovalRequest, reference ApprovalReference, currentFingerprint string, now time.Time) *contracts.ServiceError {
	fail := func(code, message string) *contracts.ServiceError {
		return &contracts.ServiceError{Code: code, Message: message, RequestID: request.RequestID}
	}
	if request.Status == "revoked" {
		return fail("APPROVAL_REVOKED", "approval was revoked")
	}
	if request.Status != "approved" {
		return fail("APPROVAL_REQUIREMENTS_NOT_MET", "approval requirements are not resolved")
	}
	if !now.Before(request.ExpiresAt) {
		return fail("APPROVAL_EXPIRED", "approval has expired")
	}
	if request.AuthorisationExpiresAt != nil && !now.Before(*request.AuthorisationExpiresAt) {
		return fail("APPROVAL_AUTHORISATION_EXPIRED", "approval authorisation has expired")
	}
	actual := []string{
		request.ID, request.OrganisationID, request.WorkspaceID, request.RunID, request.StepID,
		request.CapabilityID, request.SkillID, request.ToolID, request.ToolVersion,
		request.Operation, request.PolicyDecisionID, request.RequestFingerprint,
	}
	expected := []string{
		reference.ApprovalRequestID, reference.OrganisationID, reference.WorkspaceID,
		reference.RunID, reference.StepID, reference.CapabilityID, reference.SkillID,
		reference.ToolID, reference.ToolVersion, reference.Operation,
		reference.PolicyDecisionID, reference.RequestFingerprint,
	}
	if !constantEqual(strings.Join(actual, "\x00"), strings.Join(expected, "\x00")) ||
		!constantEqual(request.RequestFingerprint, currentFingerprint) {
		return fail("APPROVAL_REQUEST_CHANGED", "approval reference does not match the current operation")
	}
	return nil
}

func EligibleUsers(users []ApproverContext, request contracts.ApprovalRequest) []string {
	result := make([]string, 0)
	for _, user := range users {
		if ValidateDecision(request, nil, user, "approved", time.Now()) == nil {
			result = append(result, user.UserID)
		}
	}
	sort.Strings(result)
	return result
}
func constantEqual(left, right string) bool {
	return len(left) == len(right) && subtle.ConstantTimeCompare([]byte(left), []byte(right)) == 1
}
func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
func intersects(left, right []string) bool {
	for _, value := range left {
		if contains(right, value) {
			return true
		}
	}
	return false
}
