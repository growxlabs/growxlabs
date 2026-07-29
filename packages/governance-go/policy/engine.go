package policy

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"growx/commandcenter/governance/contracts"
)

var allowedFields = map[string]bool{
	"user_id": true, "role_id": true, "team_id": true, "organisation_id": true,
	"workspace_id": true, "agent_id": true, "capability_id": true, "skill_id": true,
	"tool_id": true, "tool_version": true, "domain": true, "operation": true,
	"execution_mode": true, "sensitivity": true, "data_classification": true,
	"requested_amount": true, "record_count": true, "external_side_effect": true,
	"destructive": true, "business_hours": true, "request_origin": true,
}
var allowedOperators = map[string]bool{
	"equals": true, "not_equals": true, "in": true, "not_in": true,
	"greater_than": true, "greater_than_or_equal": true, "less_than": true,
	"less_than_or_equal": true, "exists": true, "not_exists": true,
	"contains": true, "starts_with": true, "matches_allowlisted_pattern": true,
}
var sensitiveDefaultDeny = map[string]bool{
	"payment.initiate": true, "payroll.execute": true, "employee.terminate": true,
	"permission.change": true, "role.change": true, "policy.activate": true,
	"policy.disable": true, "approval_policy.change": true, "audit_retention.change": true,
	"record.delete": true, "bulk.update": true, "external.publish": true,
	"confidential.export": true, "cross_workspace": true, "cross_organisation": true,
}

type Registry struct {
	mu       sync.RWMutex
	versions map[string]map[string]contracts.PolicyDefinition
}

func NewRegistry() *Registry {
	return &Registry{versions: make(map[string]map[string]contracts.PolicyDefinition)}
}
func (r *Registry) Register(definition contracts.PolicyDefinition) error {
	if err := ValidateDefinition(definition); err != nil {
		return err
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.versions[definition.ID] == nil {
		r.versions[definition.ID] = make(map[string]contracts.PolicyDefinition)
	}
	if _, exists := r.versions[definition.ID][definition.Version]; exists {
		return errors.New("duplicate policy ID and version")
	}
	r.versions[definition.ID][definition.Version] = definition
	return nil
}
func (r *Registry) Active() []contracts.PolicyDefinition {
	r.mu.RLock()
	defer r.mu.RUnlock()
	result := make([]contracts.PolicyDefinition, 0)
	for _, versions := range r.versions {
		for _, definition := range versions {
			if definition.Status == "active" {
				result = append(result, definition)
			}
		}
	}
	sort.Slice(result, func(i, j int) bool {
		if result[i].Priority == result[j].Priority {
			return result[i].ID+"@"+result[i].Version < result[j].ID+"@"+result[j].Version
		}
		return result[i].Priority > result[j].Priority
	})
	return result
}

func ValidateDefinition(definition contracts.PolicyDefinition) error {
	if definition.ID == "" || definition.Version == "" || definition.Name == "" {
		return errors.New("policy ID, version and name are required")
	}
	if !contains([]string{"access", "execution", "approval", "data", "financial", "hr", "security", "retention"}, definition.Category) {
		return errors.New("invalid policy category")
	}
	if !contains([]string{"allow", "deny", "require_approval", "require_additional_permission", "require_multi_approval", "require_redaction"}, definition.Effect) {
		return errors.New("invalid policy effect")
	}
	if !contains([]string{"draft", "active", "disabled", "deprecated"}, definition.Status) {
		return errors.New("invalid policy status")
	}
	for _, condition := range definition.Conditions {
		if !allowedFields[condition.Field] || !allowedOperators[condition.Operator] {
			return fmt.Errorf("invalid policy condition %s/%s", condition.Field, condition.Operator)
		}
		if condition.Operator == "matches_allowlisted_pattern" {
			var pattern string
			if json.Unmarshal(condition.Value, &pattern) != nil || !strings.HasPrefix(pattern, "^") || !strings.HasSuffix(pattern, "$") || len(pattern) > 128 {
				return errors.New("pattern must be anchored and bounded")
			}
			if _, err := regexp.Compile(pattern); err != nil {
				return errors.New("invalid allowlisted pattern")
			}
		}
	}
	if strings.Contains(definition.Effect, "approval") {
		requirement := definition.ApprovalRequirements
		if requirement == nil || requirement.MinimumApprovals < 1 || requirement.MinimumApprovals > 5 ||
			requirement.ExpiresAfterSeconds < 60 || requirement.ExpiresAfterSeconds > 604800 {
			return errors.New("valid bounded approval requirements are required")
		}
	}
	checksum, err := Checksum(definition)
	if err != nil || definition.Checksum != checksum {
		return errors.New("policy checksum is invalid")
	}
	return nil
}

func Checksum(definition contracts.PolicyDefinition) (string, error) {
	copy := definition
	copy.Checksum, copy.CreatedAt, copy.ActivatedAt = "", time.Time{}, nil
	payload, err := json.Marshal(copy)
	if err != nil {
		return "", err
	}
	hash := sha256.Sum256(payload)
	return hex.EncodeToString(hash[:]), nil
}

func Evaluate(ctx contracts.EvaluationContext, definitions []contracts.PolicyDefinition, now time.Time) contracts.PolicyDecision {
	matched := make([]contracts.PolicyDefinition, 0)
	for _, definition := range definitions {
		if definition.Status == "active" && scopeMatches(definition.Scope, ctx) && conditionsMatch(definition.Conditions, ctx) {
			matched = append(matched, definition)
		}
	}
	sort.Slice(matched, func(i, j int) bool {
		if effectRank(matched[i].Effect) == effectRank(matched[j].Effect) {
			if matched[i].Priority == matched[j].Priority {
				return matched[i].ID+"@"+matched[i].Version < matched[j].ID+"@"+matched[j].Version
			}
			return matched[i].Priority > matched[j].Priority
		}
		return effectRank(matched[i].Effect) < effectRank(matched[j].Effect)
	})
	decision := contracts.PolicyDecision{
		DecisionID: deterministicID(ctx, now), RiskLevel: ClassifyRisk(ctx),
		Result: "denied", ReasonCodes: []string{"SENSITIVE_DEFAULT_DENY"},
		SafeExplanation: "The operation is not permitted by the active policy set.",
		EvaluatedAt:     now.UTC(), PolicyVersionIDs: []string{}, RequiredPermissions: []string{},
	}
	if len(matched) == 0 {
		if boolAttribute(ctx, "static_requires_approval") {
			expires := now.Add(time.Hour)
			decision.Result, decision.ReasonCodes, decision.SafeExplanation = "approval_required", []string{"TOOL_APPROVAL_REQUIRED"}, "Approval is required before execution."
			decision.ApprovalRequirements = &contracts.ResolvedApprovalRequirements{
				MinimumApprovals: 1, ProhibitSelfApproval: true,
				RequireDistinctApprovers: true, ExpiresAt: expires,
			}
			return decision
		}
		if !isSensitive(ctx) {
			decision.Result, decision.ReasonCodes, decision.SafeExplanation = "allowed", []string{"AUTHORISED_LOW_RISK_DEFAULT"}, "The authorised low-risk operation may proceed."
		}
		return decision
	}
	for _, definition := range matched {
		decision.PolicyVersionIDs = append(decision.PolicyVersionIDs, definition.ID+"@"+definition.Version)
		decision.RequiredPermissions = appendUnique(decision.RequiredPermissions, definition.RequiredPermissions...)
	}
	winner := matched[0]
	switch winner.Effect {
	case "allow":
		decision.Result, decision.ReasonCodes, decision.SafeExplanation = "allowed", []string{"POLICY_ALLOW"}, "An active policy permits this operation."
	case "deny":
		decision.Result, decision.ReasonCodes, decision.SafeExplanation = "denied", []string{"POLICY_DENY"}, "An active policy denies this operation."
	case "require_additional_permission":
		decision.Result, decision.ReasonCodes, decision.SafeExplanation = "additional_permission_required", []string{"ADDITIONAL_PERMISSION_REQUIRED"}, "Additional permission is required."
	case "require_redaction":
		decision.Result, decision.ReasonCodes, decision.SafeExplanation = "redaction_required", []string{"REDACTION_REQUIRED"}, "The result must be redacted."
	case "require_approval", "require_multi_approval":
		decision.Result, decision.ReasonCodes, decision.SafeExplanation = "approval_required", []string{"APPROVAL_REQUIRED"}, "Approval is required before execution."
		requirement := winner.ApprovalRequirements
		expires := now.Add(time.Duration(requirement.ExpiresAfterSeconds) * time.Second)
		decision.ApprovalRequirements = &contracts.ResolvedApprovalRequirements{
			MinimumApprovals: requirement.MinimumApprovals, EligibleRoleIDs: requirement.RequiredRoleIDs,
			EligibleTeamIDs: requirement.RequiredTeamIDs, ProhibitSelfApproval: requirement.ProhibitSelfApproval,
			RequireDistinctApprovers: requirement.RequireDistinctApprovers, ExpiresAt: expires,
		}
		if requirement.AuthorisationValiditySeconds > 0 {
			value := now.Add(time.Duration(requirement.AuthorisationValiditySeconds) * time.Second)
			decision.ApprovalRequirements.AuthorisationExpiresAt = &value
		}
	}
	return decision
}

func ClassifyRisk(ctx contracts.EvaluationContext) string {
	key := ctx.Domain + "." + ctx.Operation
	if contains([]string{"payment.initiate", "payroll.execute", "employee.terminate", "role.change", "permission.change", "policy.disable"}, key) {
		return "critical"
	}
	if ctx.ExecutionMode == "destructive" || ctx.Sensitivity == "restricted" || ctx.DataClassification == "highly_restricted" {
		return "critical"
	}
	if ctx.DataClassification == "restricted" || ctx.Sensitivity == "high" || boolAttribute(ctx, "external_side_effect") || numberAttribute(ctx, "record_count") > 100 {
		return "high"
	}
	if ctx.ExecutionMode == "write" {
		return "moderate"
	}
	return "low"
}

func isSensitive(ctx contracts.EvaluationContext) bool {
	return sensitiveDefaultDeny[ctx.Domain+"."+ctx.Operation] || ClassifyRisk(ctx) == "critical" || ctx.DataClassification == "highly_restricted"
}
func scopeMatches(scope contracts.Scope, ctx contracts.EvaluationContext) bool {
	return optionalContains(scope.OrganisationIDs, ctx.OrganisationID) && optionalContains(scope.WorkspaceIDs, ctx.WorkspaceID) &&
		optionalContains(scope.AgentIDs, ctx.AgentID) && optionalContains(scope.CapabilityIDs, ctx.CapabilityID) &&
		optionalContains(scope.SkillIDs, ctx.SkillID) && optionalContains(scope.ToolIDs, ctx.ToolID) &&
		optionalContains(scope.Domains, ctx.Domain) && (len(scope.TeamIDs) == 0 || intersects(scope.TeamIDs, ctx.TeamIDs))
}
func conditionsMatch(conditions []contracts.Condition, ctx contracts.EvaluationContext) bool {
	for _, condition := range conditions {
		if !match(condition, fieldValue(condition.Field, ctx)) {
			return false
		}
	}
	return true
}
func fieldValue(field string, ctx contracts.EvaluationContext) json.RawMessage {
	values := map[string]any{
		"user_id": ctx.UserID, "role_id": ctx.RoleIDs, "team_id": ctx.TeamIDs, "organisation_id": ctx.OrganisationID,
		"workspace_id": ctx.WorkspaceID, "agent_id": ctx.AgentID, "capability_id": ctx.CapabilityID,
		"skill_id": ctx.SkillID, "tool_id": ctx.ToolID, "tool_version": ctx.ToolVersion, "domain": ctx.Domain,
		"operation": ctx.Operation, "execution_mode": ctx.ExecutionMode, "sensitivity": ctx.Sensitivity,
		"data_classification": ctx.DataClassification,
	}
	if value, exists := values[field]; exists {
		raw, _ := json.Marshal(value)
		return raw
	}
	return ctx.Attributes[field]
}
func match(condition contracts.Condition, actual json.RawMessage) bool {
	exists := len(actual) > 0 && !bytes.Equal(actual, []byte("null"))
	if condition.Operator == "exists" {
		return exists
	}
	if condition.Operator == "not_exists" {
		return !exists
	}
	if !exists {
		return false
	}
	var a, expected any
	if json.Unmarshal(actual, &a) != nil || json.Unmarshal(condition.Value, &expected) != nil {
		return false
	}
	switch condition.Operator {
	case "equals", "not_equals":
		equal := fmt.Sprint(a) == fmt.Sprint(expected)
		return equal != (condition.Operator == "not_equals")
	case "in", "not_in":
		values, ok := expected.([]any)
		found := false
		if ok {
			for _, value := range values {
				found = found || fmt.Sprint(value) == fmt.Sprint(a)
			}
		}
		return found != (condition.Operator == "not_in")
	case "contains":
		return strings.Contains(fmt.Sprint(a), fmt.Sprint(expected))
	case "starts_with":
		return strings.HasPrefix(fmt.Sprint(a), fmt.Sprint(expected))
	case "matches_allowlisted_pattern":
		pattern := fmt.Sprint(expected)
		matched, _ := regexp.MatchString(pattern, fmt.Sprint(a))
		return matched
	default:
		left, lerr := strconv.ParseFloat(fmt.Sprint(a), 64)
		right, rerr := strconv.ParseFloat(fmt.Sprint(expected), 64)
		if lerr != nil || rerr != nil {
			return false
		}
		switch condition.Operator {
		case "greater_than":
			return left > right
		case "greater_than_or_equal":
			return left >= right
		case "less_than":
			return left < right
		case "less_than_or_equal":
			return left <= right
		}
	}
	return false
}
func deterministicID(ctx contracts.EvaluationContext, now time.Time) string {
	hash := sha256.Sum256([]byte(strings.Join([]string{
		ctx.RequestID, ctx.OrganisationID, ctx.WorkspaceID, ctx.UserID,
		ctx.RunID, ctx.StepID, ctx.ToolID, ctx.ToolVersion, ctx.Operation,
	}, "|")))
	return hex.EncodeToString(hash[:16])
}
func effectRank(effect string) int {
	return map[string]int{"deny": 0, "require_additional_permission": 1, "require_multi_approval": 2, "require_approval": 3, "require_redaction": 4, "allow": 5}[effect]
}
func optionalContains(values []string, target string) bool {
	return len(values) == 0 || contains(values, target)
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
func appendUnique(values []string, additions ...string) []string {
	for _, value := range additions {
		if !contains(values, value) {
			values = append(values, value)
		}
	}
	sort.Strings(values)
	return values
}
func boolAttribute(ctx contracts.EvaluationContext, name string) bool {
	var value bool
	_ = json.Unmarshal(ctx.Attributes[name], &value)
	return value
}
func numberAttribute(ctx contracts.EvaluationContext, name string) float64 {
	var value float64
	_ = json.Unmarshal(ctx.Attributes[name], &value)
	return value
}
