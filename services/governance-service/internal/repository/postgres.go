package repository

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"growx/commandcenter/governance/approvals"
	"growx/commandcenter/governance/audit"
	"growx/commandcenter/governance/contracts"
	"growx/commandcenter/phase4/servicekit"
)

type Postgres struct{ pool *pgxpool.Pool }

func Open(ctx context.Context, databaseURL string) (*Postgres, error) {
	pool, err := servicekit.OpenPostgresPool(ctx, databaseURL)
	if err != nil {
		return nil, err
	}
	return &Postgres{pool: pool}, nil
}
func (p *Postgres) Close()                          { p.pool.Close() }
func (p *Postgres) Ready(ctx context.Context) error { return p.pool.Ping(ctx) }

func (p *Postgres) ActivePolicies(ctx context.Context, organisationID, workspaceID string) ([]contracts.PolicyDefinition, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT policy_id,version,name,description,category,scope,priority,conditions,effect,
		       required_permissions,approval_requirements,status,created_at,activated_at,checksum,metadata
		FROM command_governance.policy_versions
		WHERE status='active'
		  AND (organisation_id IS NULL OR organisation_id=$1)
		  AND (workspace_id IS NULL OR workspace_id=$2)
		ORDER BY priority DESC,policy_id,version`, organisationID, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []contracts.PolicyDefinition{}
	for rows.Next() {
		var item contracts.PolicyDefinition
		var scope, conditions, permissions, requirement, metadata []byte
		if err := rows.Scan(&item.ID, &item.Version, &item.Name, &item.Description, &item.Category,
			&scope, &item.Priority, &conditions, &item.Effect, &permissions, &requirement,
			&item.Status, &item.CreatedAt, &item.ActivatedAt, &item.Checksum, &metadata); err != nil {
			return nil, err
		}
		if json.Unmarshal(scope, &item.Scope) != nil || json.Unmarshal(conditions, &item.Conditions) != nil ||
			json.Unmarshal(permissions, &item.RequiredPermissions) != nil {
			return nil, errors.New("stored policy contract is invalid")
		}
		if len(requirement) > 0 && string(requirement) != "null" {
			item.ApprovalRequirements = &contracts.ApprovalRequirements{}
			if json.Unmarshal(requirement, item.ApprovalRequirements) != nil {
				return nil, errors.New("stored approval requirements are invalid")
			}
		}
		item.Metadata = metadata
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *Postgres) SavePolicyDecision(ctx context.Context, input contracts.EvaluationContext, decision contracts.PolicyDecision, fingerprint string) error {
	versions, _ := json.Marshal(decision.PolicyVersionIDs)
	permissions, _ := json.Marshal(decision.RequiredPermissions)
	requirements, _ := json.Marshal(decision.ApprovalRequirements)
	reasons, _ := json.Marshal(decision.ReasonCodes)
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	_, err = tx.Exec(ctx, `
		INSERT INTO command_governance.policy_decisions
		    (id,organisation_id,workspace_id,request_id,trace_id,user_id,tool_id,operation,
		     run_id,step_id,result,risk_level,policy_version_ids,required_permissions,approval_requirements,
		     reason_codes,context_fingerprint,evaluated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULLIF($9,'')::uuid,NULLIF($10,'')::uuid,
		        $11,$12,$13,$14,$15,$16,$17,$18)
		ON CONFLICT (id) DO NOTHING`,
		decision.DecisionID, input.OrganisationID, input.WorkspaceID, input.RequestID,
		input.TraceID, input.UserID, input.ToolID, input.Operation, input.RunID, input.StepID, decision.Result,
		decision.RiskLevel, versions, permissions, requirements, reasons, fingerprint, decision.EvaluatedAt)
	if err != nil {
		return err
	}
	if err := insertOutbox(ctx, tx, input.OrganisationID, input.WorkspaceID, "policy_evaluated", map[string]any{
		"requestId": input.RequestID, "decisionId": decision.DecisionID, "result": decision.Result,
		"riskLevel": decision.RiskLevel, "actorId": input.UserID,
	}); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

type CreateApprovalInput struct {
	Request        contracts.ApprovalRequest
	IdempotencyKey string
}

func (p *Postgres) CreateApproval(ctx context.Context, input CreateApprovalInput) (contracts.ApprovalRequest, bool, error) {
	request := input.Request
	request.Version, request.Status = "1.0.0", "pending"
	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return request, false, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var storedRequirements, storedVersions []byte
	err = tx.QueryRow(ctx, `
		  SELECT approval_requirements,policy_version_ids,risk_level
		  FROM command_governance.policy_decisions
		  WHERE id=$1 AND organisation_id=$2 AND workspace_id=$3 AND user_id=$4
		    AND run_id=$5::uuid AND (step_id IS NOT DISTINCT FROM NULLIF($6,'')::uuid)
		    AND tool_id=$7 AND operation=$8 AND context_fingerprint=$9
		    AND result='approval_required'
		`,
		request.PolicyDecisionID, request.OrganisationID, request.WorkspaceID,
		request.RequestedByUserID, request.RunID, request.StepID, request.ToolID,
		request.Operation, request.RequestFingerprint).Scan(&storedRequirements, &storedVersions, &request.RiskLevel)
	if err != nil {
		return request, false, errors.New("approval request does not match an authoritative policy decision")
	}
	var requirement contracts.ResolvedApprovalRequirements
	if json.Unmarshal(storedRequirements, &requirement) != nil || json.Unmarshal(storedVersions, &request.PolicyVersionIDs) != nil {
		return request, false, errors.New("stored policy approval requirements are invalid")
	}
	request.MinimumApprovals, request.EligibleRoleIDs, request.EligibleTeamIDs =
		requirement.MinimumApprovals, requirement.EligibleRoleIDs, requirement.EligibleTeamIDs
	request.ProhibitSelfApproval, request.RequireDistinctApprovers =
		requirement.ProhibitSelfApproval, requirement.RequireDistinctApprovers
	request.ExpiresAt, request.AuthorisationExpiresAt = requirement.ExpiresAt, requirement.AuthorisationExpiresAt
	versions, _ := json.Marshal(request.PolicyVersionIDs)
	roles, _ := json.Marshal(request.EligibleRoleIDs)
	teams, _ := json.Marshal(request.EligibleTeamIDs)
	err = tx.QueryRow(ctx, `
		INSERT INTO command_governance.approval_requests
		    (request_id,trace_id,run_id,step_id,organisation_id,workspace_id,
		     requested_by_user_id,requested_by_agent_id,policy_decision_id,policy_version_ids,
		     capability_id,skill_id,tool_id,tool_version,domain,operation,risk_level,title,
		     safe_summary,resource_type,resource_id,request_fingerprint,minimum_approvals,
		     eligible_role_ids,eligible_team_ids,prohibit_self_approval,require_distinct_approvers,
		     status,expires_at,authorisation_expires_at,idempotency_key)
		VALUES ($1,$2,$3::uuid,NULLIF($4,'')::uuid,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
		        $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,'pending',$28,$29,$30)
		ON CONFLICT (organisation_id,workspace_id,idempotency_key) DO NOTHING
		RETURNING id::text,created_at`,
		request.RequestID, request.TraceID, request.RunID, request.StepID, request.OrganisationID,
		request.WorkspaceID, request.RequestedByUserID, request.RequestedByAgentID,
		request.PolicyDecisionID, versions, request.CapabilityID, request.SkillID, request.ToolID,
		request.ToolVersion, request.Domain, request.Operation, request.RiskLevel, request.Title,
		request.SafeSummary, request.ResourceType, request.ResourceID, request.RequestFingerprint,
		request.MinimumApprovals, roles, teams, request.ProhibitSelfApproval,
		request.RequireDistinctApprovers, request.ExpiresAt, request.AuthorisationExpiresAt,
		input.IdempotencyKey).Scan(&request.ID, &request.CreatedAt)
	created := err == nil
	if errors.Is(err, pgx.ErrNoRows) {
		err = tx.QueryRow(ctx, `
			SELECT id::text,version,status,created_at,resolved_at
			FROM command_governance.approval_requests
			WHERE organisation_id=$1 AND workspace_id=$2 AND idempotency_key=$3`,
			request.OrganisationID, request.WorkspaceID, input.IdempotencyKey).
			Scan(&request.ID, &request.Version, &request.Status, &request.CreatedAt, &request.ResolvedAt)
	}
	if err != nil {
		return request, false, err
	}
	if created {
		_, err = tx.Exec(ctx, `
			INSERT INTO command_governance.approval_execution_links
			    (approval_request_id,run_id,step_id,organisation_id,workspace_id)
			VALUES ($1::uuid,$2::uuid,NULLIF($3,'')::uuid,$4,$5)`,
			request.ID, request.RunID, request.StepID, request.OrganisationID, request.WorkspaceID)
		if err != nil {
			return request, false, err
		}
		_, err = tx.Exec(ctx, `
			UPDATE command_execution.steps SET status='blocked',governance_status='blocked_for_approval',updated_at=now()
			WHERE id=NULLIF($1,'')::uuid AND run_id=$2::uuid AND organisation_id=$3 AND workspace_id=$4`,
			request.StepID, request.RunID, request.OrganisationID, request.WorkspaceID)
		if err != nil {
			return request, false, err
		}
		_, err = tx.Exec(ctx, `UPDATE command_execution.runs SET status='waiting',updated_at=now()
			WHERE id=$1::uuid AND organisation_id=$2 AND workspace_id=$3`,
			request.RunID, request.OrganisationID, request.WorkspaceID)
		if err != nil {
			return request, false, err
		}
		if err = insertOutbox(ctx, tx, request.OrganisationID, request.WorkspaceID, "approval_requested", map[string]any{
			"requestId": request.RequestID, "approvalRequestId": request.ID,
			"runId": request.RunID, "stepId": request.StepID, "actorId": request.RequestedByUserID,
		}); err != nil {
			return request, false, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return request, false, err
	}
	return request, created, nil
}

func (p *Postgres) Approval(ctx context.Context, organisationID, workspaceID, approvalID string) (contracts.ApprovalRequest, []contracts.ApprovalDecision, error) {
	var request contracts.ApprovalRequest
	var versions, roles, teams []byte
	err := p.pool.QueryRow(ctx, `
		SELECT id::text,version,request_id,COALESCE(trace_id,''),run_id::text,COALESCE(step_id::text,''),
		       organisation_id,workspace_id,requested_by_user_id,COALESCE(requested_by_agent_id,''),
		       policy_decision_id,policy_version_ids,capability_id,COALESCE(skill_id,''),tool_id,
		       tool_version,domain,operation,risk_level,title,safe_summary,COALESCE(resource_type,''),
		       COALESCE(resource_id,''),request_fingerprint,minimum_approvals,eligible_role_ids,
		       eligible_team_ids,prohibit_self_approval,require_distinct_approvers,status,expires_at,
		       authorisation_expires_at,created_at,resolved_at
		FROM command_governance.approval_requests
		WHERE id=$1::uuid AND organisation_id=$2 AND workspace_id=$3`,
		approvalID, organisationID, workspaceID).Scan(
		&request.ID, &request.Version, &request.RequestID, &request.TraceID, &request.RunID,
		&request.StepID, &request.OrganisationID, &request.WorkspaceID, &request.RequestedByUserID,
		&request.RequestedByAgentID, &request.PolicyDecisionID, &versions, &request.CapabilityID,
		&request.SkillID, &request.ToolID, &request.ToolVersion, &request.Domain, &request.Operation,
		&request.RiskLevel, &request.Title, &request.SafeSummary, &request.ResourceType,
		&request.ResourceID, &request.RequestFingerprint, &request.MinimumApprovals, &roles, &teams,
		&request.ProhibitSelfApproval, &request.RequireDistinctApprovers, &request.Status,
		&request.ExpiresAt, &request.AuthorisationExpiresAt, &request.CreatedAt, &request.ResolvedAt)
	if err != nil {
		return request, nil, err
	}
	_ = json.Unmarshal(versions, &request.PolicyVersionIDs)
	_ = json.Unmarshal(roles, &request.EligibleRoleIDs)
	_ = json.Unmarshal(teams, &request.EligibleTeamIDs)
	rows, err := p.pool.Query(ctx, `
		SELECT id::text,approval_request_id::text,organisation_id,workspace_id,approver_user_id,
		       approver_role_ids,approver_team_ids,decision,COALESCE(reason,''),evidence,created_at
		FROM command_governance.approval_decisions
		WHERE approval_request_id=$1::uuid ORDER BY created_at,id`, approvalID)
	if err != nil {
		return request, nil, err
	}
	defer rows.Close()
	decisions := []contracts.ApprovalDecision{}
	for rows.Next() {
		var item contracts.ApprovalDecision
		var itemRoles, itemTeams []byte
		if err := rows.Scan(&item.ID, &item.ApprovalRequestID, &item.OrganisationID,
			&item.WorkspaceID, &item.ApproverUserID, &itemRoles, &itemTeams,
			&item.Decision, &item.Reason, &item.Evidence, &item.CreatedAt); err != nil {
			return request, nil, err
		}
		_ = json.Unmarshal(itemRoles, &item.ApproverRoleIDs)
		_ = json.Unmarshal(itemTeams, &item.ApproverTeamIDs)
		decisions = append(decisions, item)
	}
	return request, decisions, rows.Err()
}

func (p *Postgres) ResolveApprover(ctx context.Context, organisationID, workspaceID, userID string) (approvals.ApproverContext, error) {
	result := approvals.ApproverContext{UserID: userID, OrganisationID: organisationID}
	var workspace string
	err := p.pool.QueryRow(ctx, `
		SELECT COALESCE(workspace_id::text,''),status='active'
		FROM identity.users WHERE id=$1::uuid AND organisation_id=$2::uuid`,
		userID, organisationID).Scan(&workspace, &result.Active)
	if err != nil {
		return result, err
	}
	if workspace == "" || workspace == workspaceID {
		result.WorkspaceIDs = []string{workspaceID}
	}
	rows, err := p.pool.Query(ctx, `
		SELECT DISTINCT r.id::text,COALESCE(r.workspace_id::text,''),COALESCE(p.key,'')
		FROM identity.user_roles ur
		JOIN identity.roles r ON r.id=ur.role_id AND r.organisation_id=ur.organisation_id
		LEFT JOIN identity.role_permissions rp ON rp.role_id=r.id
		LEFT JOIN identity.permissions p ON p.id=rp.permission_id
		WHERE ur.user_id=$1::uuid AND ur.organisation_id=$2::uuid
		  AND (r.workspace_id IS NULL OR r.workspace_id=$3::uuid)`, userID, organisationID, workspaceID)
	if err != nil {
		return result, err
	}
	defer rows.Close()
	for rows.Next() {
		var roleID, roleWorkspace, permission string
		if err := rows.Scan(&roleID, &roleWorkspace, &permission); err != nil {
			return result, err
		}
		result.RoleIDs = appendUnique(result.RoleIDs, roleID)
		if permission != "" {
			result.Permissions = appendUnique(result.Permissions, permission)
		}
	}
	return result, rows.Err()
}

func (p *Postgres) Decide(ctx context.Context, organisationID, workspaceID, approvalID, userID, decision, reason, idempotencyKey string, evidence json.RawMessage, now time.Time) (contracts.ApprovalRequest, error) {
	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return contracts.ApprovalRequest{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var locked bool
	err = tx.QueryRow(ctx, `
		SELECT true FROM command_governance.approval_requests
		WHERE id=$1::uuid AND organisation_id=$2 AND workspace_id=$3 FOR UPDATE`,
		approvalID, organisationID, workspaceID).Scan(&locked)
	if err != nil || !locked {
		return contracts.ApprovalRequest{}, err
	}
	request, existing, err := p.Approval(ctx, organisationID, workspaceID, approvalID)
	if err != nil {
		return request, err
	}
	approver, err := p.ResolveApprover(ctx, organisationID, workspaceID, userID)
	if err != nil {
		return request, err
	}
	if serviceError := approvals.ValidateDecision(request, existing, approver, decision, now); serviceError != nil {
		if serviceError.Code == "APPROVAL_SELF_APPROVAL_BLOCKED" {
			_ = insertOutbox(ctx, tx, organisationID, workspaceID, "self_approval_blocked", map[string]any{
				"requestId": request.RequestID, "approvalRequestId": request.ID, "actorId": userID,
			})
			_ = tx.Commit(ctx)
		}
		return request, serviceError
	}
	roles, _ := json.Marshal(approver.RoleIDs)
	teams, _ := json.Marshal(approver.TeamIDs)
	var decisionID string
	err = tx.QueryRow(ctx, `
		INSERT INTO command_governance.approval_decisions
		    (approval_request_id,organisation_id,workspace_id,approver_user_id,
		     approver_role_ids,approver_team_ids,decision,reason,evidence,idempotency_key)
		VALUES ($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		ON CONFLICT (organisation_id,workspace_id,idempotency_key) DO UPDATE
		SET idempotency_key=EXCLUDED.idempotency_key
		RETURNING id::text`,
		approvalID, organisationID, workspaceID, userID, roles, teams, decision,
		reason, evidence, idempotencyKey).Scan(&decisionID)
	if err != nil {
		return request, err
	}
	newDecision := contracts.ApprovalDecision{ID: decisionID, ApprovalRequestID: approvalID,
		OrganisationID: organisationID, WorkspaceID: workspaceID, ApproverUserID: userID,
		ApproverRoleIDs: approver.RoleIDs, ApproverTeamIDs: approver.TeamIDs,
		Decision: decision, Reason: reason, Evidence: evidence, CreatedAt: now}
	status, err := approvals.DeriveStatus(request, append(existing, newDecision))
	if err != nil {
		return request, err
	}
	var resolvedAt any
	if status == "approved" || status == "rejected" {
		resolvedAt = now
	}
	tag, err := tx.Exec(ctx, `
		UPDATE command_governance.approval_requests SET status=$4,resolved_at=$5
		WHERE id=$1::uuid AND organisation_id=$2 AND workspace_id=$3
		  AND status IN ('pending','partially_approved')`,
		approvalID, organisationID, workspaceID, status, resolvedAt)
	if err != nil || tag.RowsAffected() != 1 {
		return request, errors.New("approval changed concurrently")
	}
	request.Status = status
	if resolvedAt != nil {
		value := now
		request.ResolvedAt = &value
	}
	eventType := "approval_" + decision
	if status == "partially_approved" {
		eventType = "approval_partially_approved"
	}
	if err = insertOutbox(ctx, tx, organisationID, workspaceID, eventType, map[string]any{
		"requestId": request.RequestID, "approvalRequestId": request.ID, "decisionId": decisionID,
		"runId": request.RunID, "stepId": request.StepID, "actorId": userID, "status": status,
	}); err != nil {
		return request, err
	}
	if status == "approved" {
		_, err = tx.Exec(ctx, `
			UPDATE command_execution.steps SET status='pending',governance_status=NULL,
			    updated_at=now()
			WHERE id=NULLIF($1,'')::uuid AND run_id=$2::uuid
			  AND organisation_id=$3 AND workspace_id=$4 AND status='blocked'
			  AND governance_status='blocked_for_approval'`,
			request.StepID, request.RunID, organisationID, workspaceID)
		if err != nil {
			return request, err
		}
		_, err = tx.Exec(ctx, `
			UPDATE command_execution.runs SET status='running',updated_at=now()
			WHERE id=$1::uuid AND organisation_id=$2 AND workspace_id=$3 AND status='waiting'`,
			request.RunID, organisationID, workspaceID)
	} else if status == "rejected" {
		_, err = tx.Exec(ctx, `
			UPDATE command_execution.steps SET status='blocked',
			    governance_status='rejected_by_approver',updated_at=now()
			WHERE id=NULLIF($1,'')::uuid AND run_id=$2::uuid
			  AND organisation_id=$3 AND workspace_id=$4`,
			request.StepID, request.RunID, organisationID, workspaceID)
	}
	if err != nil {
		return request, err
	}
	return request, tx.Commit(ctx)
}

func (p *Postgres) Revoke(ctx context.Context, organisationID, workspaceID, approvalID, actorID, reasonCode, safeReason string) error {
	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	tag, err := tx.Exec(ctx, `
		UPDATE command_governance.approval_requests
		SET status='revoked',resolved_at=COALESCE(resolved_at,now())
		WHERE id=$1::uuid AND organisation_id=$2 AND workspace_id=$3
		  AND status IN ('pending','partially_approved','approved')`,
		approvalID, organisationID, workspaceID)
	if err != nil || tag.RowsAffected() != 1 {
		return errors.New("approval cannot be revoked")
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO command_governance.approval_revocations
		    (approval_request_id,organisation_id,workspace_id,revoked_by_user_id,reason_code,safe_reason)
		VALUES ($1::uuid,$2,$3,$4,$5,$6)`,
		approvalID, organisationID, workspaceID, actorID, reasonCode, safeReason)
	if err != nil {
		return err
	}
	if err = insertOutbox(ctx, tx, organisationID, workspaceID, "approval_revoked", map[string]any{
		"approvalRequestId": approvalID, "actorId": actorID, "reasonCode": reasonCode,
	}); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (p *Postgres) ListApprovals(ctx context.Context, organisationID, workspaceID, userID, status string, limit int) ([]contracts.ApprovalRequest, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id::text,request_id,run_id::text,COALESCE(step_id::text,''),organisation_id,
		       workspace_id,requested_by_user_id,policy_decision_id,tool_id,tool_version,
		       domain,operation,risk_level,title,safe_summary,minimum_approvals,
		       prohibit_self_approval,require_distinct_approvers,status,expires_at,
		       authorisation_expires_at,created_at,resolved_at
		FROM command_governance.approval_requests ar
		WHERE organisation_id=$1 AND workspace_id=$2
		  AND ($3='' OR status=$3)
		  AND (
		    requested_by_user_id=$4 OR EXISTS (
		      SELECT 1 FROM identity.user_roles ur
		      JOIN identity.roles r ON r.id=ur.role_id
		      JOIN identity.role_permissions rp ON rp.role_id=r.id
		      JOIN identity.permissions p ON p.id=rp.permission_id
		      WHERE ur.user_id=$4::uuid AND ur.organisation_id=$1::uuid
		        AND p.key='governance.approvals.decide'
		        AND (r.workspace_id IS NULL OR r.workspace_id=$2::uuid)
		    )
		  )
		ORDER BY created_at DESC,id DESC LIMIT $5`,
		organisationID, workspaceID, status, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []contracts.ApprovalRequest{}
	for rows.Next() {
		var item contracts.ApprovalRequest
		if err := rows.Scan(&item.ID, &item.RequestID, &item.RunID, &item.StepID,
			&item.OrganisationID, &item.WorkspaceID, &item.RequestedByUserID,
			&item.PolicyDecisionID, &item.ToolID, &item.ToolVersion, &item.Domain,
			&item.Operation, &item.RiskLevel, &item.Title, &item.SafeSummary,
			&item.MinimumApprovals, &item.ProhibitSelfApproval, &item.RequireDistinctApprovers,
			&item.Status, &item.ExpiresAt, &item.AuthorisationExpiresAt,
			&item.CreatedAt, &item.ResolvedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *Postgres) ExpireApprovals(ctx context.Context, owner string, limit int) (int, error) {
	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return 0, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	acquired, err := acquireLock(ctx, tx, "expire-approvals", owner, 50*time.Second)
	if err != nil || !acquired {
		return 0, err
	}
	rows, err := tx.Query(ctx, `
		SELECT id::text,organisation_id,workspace_id,request_id,run_id::text,COALESCE(step_id::text,'')
		FROM command_governance.approval_requests
		WHERE status IN ('pending','partially_approved') AND expires_at<=now()
		ORDER BY expires_at,id FOR UPDATE SKIP LOCKED LIMIT $1`, limit)
	if err != nil {
		return 0, err
	}
	type expired struct{ id, organisationID, workspaceID, requestID, runID, stepID string }
	items := []expired{}
	for rows.Next() {
		var item expired
		if err := rows.Scan(&item.id, &item.organisationID, &item.workspaceID, &item.requestID, &item.runID, &item.stepID); err != nil {
			rows.Close()
			return 0, err
		}
		items = append(items, item)
	}
	rows.Close()
	for _, item := range items {
		_, err = tx.Exec(ctx, `UPDATE command_governance.approval_requests
			SET status='expired',resolved_at=now() WHERE id=$1::uuid
			  AND status IN ('pending','partially_approved')`, item.id)
		if err != nil {
			return 0, err
		}
		if err = insertOutbox(ctx, tx, item.organisationID, item.workspaceID, "approval_expired", map[string]any{
			"requestId": item.requestID, "approvalRequestId": item.id,
			"runId": item.runID, "stepId": item.stepID, "actorId": "governance-cron",
		}); err != nil {
			return 0, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return 0, err
	}
	return len(items), nil
}

func (p *Postgres) ProcessOutbox(ctx context.Context, owner string, limit int) (int, int, error) {
	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return 0, 0, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	acquired, err := acquireLock(ctx, tx, "process-audit-outbox", owner, 50*time.Second)
	if err != nil || !acquired {
		return 0, 0, err
	}
	rows, err := tx.Query(ctx, `
		SELECT id::text,event_id,organisation_id,COALESCE(workspace_id,''),event_type,event_payload
		FROM command_governance.audit_outbox
		WHERE (
		    status IN ('pending','failed') AND next_attempt_at<=now()
		) OR (
		    status='claimed' AND claimed_until<now()
		)
		ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT $1`, limit)
	if err != nil {
		return 0, 0, err
	}
	type item struct {
		id, eventID, organisationID, workspaceID, eventType string
		payload                                             []byte
	}
	items := []item{}
	for rows.Next() {
		var value item
		if err := rows.Scan(&value.id, &value.eventID, &value.organisationID, &value.workspaceID, &value.eventType, &value.payload); err != nil {
			rows.Close()
			return 0, 0, err
		}
		items = append(items, value)
	}
	rows.Close()
	processed, failed := 0, 0
	for _, value := range items {
		if err := p.ingestOutboxEvent(ctx, tx, value.eventID, value.organisationID, value.workspaceID, value.eventType, value.payload); err != nil {
			failed++
			_, _ = tx.Exec(ctx, `UPDATE command_governance.audit_outbox
				SET status='failed',attempts=attempts+1,last_error='audit ingestion failed',
				    next_attempt_at=now()+interval '1 minute',claimed_by=NULL,claimed_until=NULL
				WHERE id=$1::uuid`, value.id)
			continue
		}
		processed++
		_, err = tx.Exec(ctx, `UPDATE command_governance.audit_outbox
			SET status='processed',attempts=attempts+1,processed_at=now(),
			    claimed_by=NULL,claimed_until=NULL,last_error=NULL WHERE id=$1::uuid`, value.id)
		if err != nil {
			return processed, failed, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return processed, failed, err
	}
	return processed, failed, nil
}

func (p *Postgres) ingestOutboxEvent(ctx context.Context, tx pgx.Tx, eventID, organisationID, workspaceID, eventType string, payload []byte) error {
	period := time.Now().UTC().Truncate(24 * time.Hour)
	_, err := tx.Exec(ctx, `
		INSERT INTO command_governance.audit_stream_heads (organisation_id,stream_period)
		VALUES ($1,$2::date) ON CONFLICT DO NOTHING`, organisationID, period)
	if err != nil {
		return err
	}
	var sequence int64
	var previousHash string
	err = tx.QueryRow(ctx, `
		SELECT last_sequence,last_hash FROM command_governance.audit_stream_heads
		WHERE organisation_id=$1 AND stream_period=$2::date FOR UPDATE`,
		organisationID, period).Scan(&sequence, &previousHash)
	if err != nil {
		return err
	}
	var safe map[string]any
	if json.Unmarshal(payload, &safe) != nil {
		return errors.New("invalid outbox payload")
	}
	requestID, _ := safe["requestId"].(string)
	actorID, _ := safe["actorId"].(string)
	if requestID == "" {
		requestID = eventID
	}
	if actorID == "" {
		actorID = "system"
	}
	event := contracts.AuditEvent{
		ID: eventID, Version: "1.0.0", EventType: eventType,
		Category: auditCategory(eventType), OrganisationID: organisationID, WorkspaceID: workspaceID,
		Actor: contracts.AuditActor{Type: "system", ID: actorID}, Action: eventType,
		RequestID: requestID, Outcome: auditOutcome(eventType), SafeMetadata: payload,
		OccurredAt: time.Now().UTC(),
	}
	event, err = audit.Link(event, sequence+1, previousHash, time.Now())
	if err != nil {
		return err
	}
	tag, err := tx.Exec(ctx, `
		INSERT INTO command_governance.audit_events
		    (id,version,sequence,event_type,category,organisation_id,workspace_id,
		     stream_period,actor_type,actor_id,action,request_id,outcome,safe_metadata,
		     occurred_at,ingested_at,previous_hash,event_hash)
		VALUES ($1,$2,$3,$4,$5,$6,NULLIF($7,''),$8::date,$9,$10,$11,$12,$13,$14,
		        $15,$16,$17,$18)
		ON CONFLICT (id) DO NOTHING`,
		event.ID, event.Version, event.Sequence, event.EventType, event.Category,
		event.OrganisationID, event.WorkspaceID, period, event.Actor.Type, event.Actor.ID,
		event.Action, event.RequestID, event.Outcome, event.SafeMetadata,
		event.OccurredAt, event.IngestedAt, event.PreviousHash, event.EventHash)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return nil
	}
	_, err = tx.Exec(ctx, `UPDATE command_governance.audit_stream_heads
		SET last_sequence=$3,last_hash=$4,updated_at=now()
		WHERE organisation_id=$1 AND stream_period=$2::date`,
		organisationID, period, event.Sequence, event.EventHash)
	return err
}

func (p *Postgres) AuditEvents(ctx context.Context, organisationID, workspaceID string, from, to time.Time, limit int) ([]contracts.AuditEvent, error) {
	if to.Sub(from) > 31*24*time.Hour {
		return nil, &contracts.ServiceError{Code: "AUDIT_RANGE_TOO_LARGE", Message: "audit range cannot exceed 31 days"}
	}
	rows, err := p.pool.Query(ctx, `
		SELECT id,version,sequence,event_type,category,organisation_id,COALESCE(workspace_id,''),
		       actor_type,actor_id,action,request_id,COALESCE(trace_id,''),COALESCE(run_id::text,''),
		       COALESCE(step_id::text,''),outcome,COALESCE(reason_code,''),safe_metadata,
		       occurred_at,ingested_at,previous_hash,event_hash
		FROM command_governance.audit_events
		WHERE organisation_id=$1 AND ($2='' OR workspace_id=$2)
		  AND occurred_at>=$3 AND occurred_at<$4
		ORDER BY occurred_at DESC,sequence DESC LIMIT $5`,
		organisationID, workspaceID, from, to, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []contracts.AuditEvent{}
	for rows.Next() {
		var item contracts.AuditEvent
		if err := rows.Scan(&item.ID, &item.Version, &item.Sequence, &item.EventType,
			&item.Category, &item.OrganisationID, &item.WorkspaceID, &item.Actor.Type,
			&item.Actor.ID, &item.Action, &item.RequestID, &item.TraceID, &item.RunID,
			&item.StepID, &item.Outcome, &item.ReasonCode, &item.SafeMetadata,
			&item.OccurredAt, &item.IngestedAt, &item.PreviousHash, &item.EventHash); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (p *Postgres) VerifyAudit(ctx context.Context, organisationID string, period time.Time) error {
	rows, err := p.pool.Query(ctx, `
		SELECT id,version,sequence,event_type,category,organisation_id,COALESCE(workspace_id,''),
		       actor_type,actor_id,action,request_id,outcome,safe_metadata,occurred_at,
		       ingested_at,previous_hash,event_hash
		FROM command_governance.audit_events
		WHERE organisation_id=$1 AND stream_period=$2::date ORDER BY sequence`, organisationID, period)
	if err != nil {
		return err
	}
	defer rows.Close()
	events := []contracts.AuditEvent{}
	for rows.Next() {
		var item contracts.AuditEvent
		if err := rows.Scan(&item.ID, &item.Version, &item.Sequence, &item.EventType,
			&item.Category, &item.OrganisationID, &item.WorkspaceID, &item.Actor.Type,
			&item.Actor.ID, &item.Action, &item.RequestID, &item.Outcome,
			&item.SafeMetadata, &item.OccurredAt, &item.IngestedAt,
			&item.PreviousHash, &item.EventHash); err != nil {
			return err
		}
		events = append(events, item)
	}
	if err := rows.Err(); err != nil {
		return err
	}
	return audit.Verify(events)
}

func acquireLock(ctx context.Context, tx pgx.Tx, name, owner string, duration time.Duration) (bool, error) {
	var acquired bool
	err := tx.QueryRow(ctx, `
		INSERT INTO command_governance.cron_locks (lock_name,owner_id,expires_at)
		VALUES ($1,$2,now()+$3::interval)
		ON CONFLICT (lock_name) DO UPDATE
		SET owner_id=EXCLUDED.owner_id,expires_at=EXCLUDED.expires_at,updated_at=now()
		WHERE command_governance.cron_locks.expires_at<now()
		RETURNING true`, name, owner, duration.String()).Scan(&acquired)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return acquired, err
}
func auditCategory(eventType string) string {
	switch {
	case len(eventType) >= 7 && eventType[:7] == "policy_":
		return "policy"
	case len(eventType) >= 9 && eventType[:9] == "approval_":
		return "approval"
	default:
		return "security"
	}
}
func auditOutcome(eventType string) string {
	if eventType == "approval_expired" {
		return "expired"
	}
	if eventType == "self_approval_blocked" {
		return "blocked"
	}
	return "success"
}

func insertOutbox(ctx context.Context, tx pgx.Tx, organisationID, workspaceID, eventType string, payload map[string]any) error {
	eventID, err := randomID()
	if err != nil {
		return err
	}
	value, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO command_governance.audit_outbox
		    (event_id,organisation_id,workspace_id,event_type,event_payload)
		VALUES ($1,$2,$3,$4,$5)`, eventID, organisationID, workspaceID, eventType, value)
	return err
}

func randomID() (string, error) {
	value := make([]byte, 16)
	if _, err := rand.Read(value); err != nil {
		return "", err
	}
	return hex.EncodeToString(value), nil
}
func appendUnique(values []string, value string) []string {
	for _, existing := range values {
		if existing == value {
			return values
		}
	}
	return append(values, value)
}
