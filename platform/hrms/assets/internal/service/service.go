package service

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
	"growx/hrms/assets/internal/domain"
	"growx/hrms/assets/internal/repository"
)

type Service struct{ Repo *repository.Repository }

func New(repo *repository.Repository) *Service { return &Service{Repo: repo} }
func (s *Service) Create(ctx context.Context, a domain.Actor, in domain.CreateAsset) (string, error) {
	if in.CategoryID == "" || in.AssetCode == "" || in.Name == "" {
		return "", errors.New("categoryId, assetCode and name are required")
	}
	var id string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `INSERT INTO assets.assets(organisation_id,category_id,asset_code,name,description,manufacturer,model,serial_number,vendor_id,location_id,purchase_date,purchase_cost,currency,warranty_expires_at,procurement_reference,metadata,created_by)VALUES($1,$2,$3,$4,$5,$6,$7,nullif($8,''),nullif($9,'')::uuid,nullif($10,'')::uuid,nullif($11,'')::date,$12,nullif($13,''),nullif($14,'')::date,$15,$16,$17)RETURNING id`, a.OrganisationID, in.CategoryID, in.AssetCode, in.Name, in.Description, in.Manufacturer, in.Model, in.SerialNumber, in.VendorID, in.LocationID, in.PurchaseDate, in.PurchaseCost, in.Currency, in.WarrantyExpiresAt, in.ProcurementReference, in.Metadata, a.UserID).Scan(&id); err != nil {
			return err
		}
		if err := repository.AppendHistory(ctx, tx, a, id, "asset.created", "", domain.Purchased, in); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, id, "asset.created", nil, in)
	})
	return id, err
}
func (s *Service) MakeAvailable(ctx context.Context, a domain.Actor, id string) error {
	return s.transition(ctx, a, id, domain.Purchased, domain.Available, "asset.received", nil)
}
func (s *Service) RequestForEmployee(ctx context.Context, a domain.Actor, employeeID string, in domain.AssetRequest) (string, error) {
	if employeeID == "" || in.CategoryID == "" || in.Reason == "" {
		return "", errors.New("employeeId, categoryId and reason are required")
	}
	var id string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `INSERT INTO assets.requests(organisation_id,employee_id,category_id,requested_specification,reason,requested_by) SELECT $1,id,$3,$4,$5,$6 FROM people.employees WHERE id=$2 AND organisation_id=$1 AND deleted_at IS NULL RETURNING id`, a.OrganisationID, employeeID, in.CategoryID, in.Specification, in.Reason, a.UserID).Scan(&id); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,ip_address,request_id) VALUES($1,$2,'asset_request',$3,'asset.requested',$4,nullif($5,'')::inet,$6)`, a.OrganisationID, a.UserID, id, in, a.IP, a.RequestID); err != nil {
			return err
		}
		_, err := tx.Exec(ctx, `INSERT INTO assets.outbox(organisation_id,topic,payload) VALUES($1,'asset.requested',$2)`, a.OrganisationID, map[string]any{"requestId": id, "employeeId": employeeID, "categoryId": in.CategoryID})
		return err
	})
	return id, err
}
func (s *Service) OpenRepair(ctx context.Context, a domain.Actor, assetID string, in domain.RepairInput) (string, error) {
	var id string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		var state domain.State
		if err := tx.QueryRow(ctx, `SELECT state FROM assets.assets WHERE id=$1 AND organisation_id=$2 FOR UPDATE`, assetID, a.OrganisationID).Scan(&state); err != nil {
			return err
		}
		if err := domain.ValidateTransition(state, domain.InRepair); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `INSERT INTO assets.repairs(organisation_id,asset_id,vendor_id,cost,currency,warranty_claim,notes,created_by)VALUES($1,$2,nullif($3,'')::uuid,$4,nullif($5,''),$6,$7,$8)RETURNING id`, a.OrganisationID, assetID, in.VendorID, in.Cost, in.Currency, in.WarrantyClaim, in.Notes, a.UserID).Scan(&id); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `UPDATE assets.assets SET state='IN_REPAIR',version=version+1,updated_at=now()WHERE id=$1 AND organisation_id=$2`, assetID, a.OrganisationID); err != nil {
			return err
		}
		if err := repository.AppendHistory(ctx, tx, a, assetID, "asset.repair_opened", state, domain.InRepair, map[string]string{"repairId": id}); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, assetID, "asset.repair_opened", map[string]any{"state": state}, in)
	})
	return id, err
}
func (s *Service) CompleteRepair(ctx context.Context, a domain.Actor, repairID string) error {
	return s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		var assetID string
		var state domain.State
		if err := tx.QueryRow(ctx, `SELECT r.asset_id,x.state FROM assets.repairs r JOIN assets.assets x ON x.id=r.asset_id WHERE r.id=$1 AND r.organisation_id=$2 AND r.status<>'COMPLETED' FOR UPDATE`, repairID, a.OrganisationID).Scan(&assetID, &state); err != nil {
			return err
		}
		if err := domain.ValidateTransition(state, domain.Available); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `UPDATE assets.repairs SET status='COMPLETED',completed_at=now()WHERE id=$1;UPDATE assets.assets SET state='AVAILABLE',version=version+1,updated_at=now()WHERE id=$2 AND organisation_id=$3`, repairID, assetID, a.OrganisationID); err != nil {
			return err
		}
		if err := repository.AppendHistory(ctx, tx, a, assetID, "asset.repair_completed", state, domain.Available, map[string]string{"repairId": repairID}); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, assetID, "asset.repair_completed", map[string]any{"state": state}, map[string]any{"state": domain.Available})
	})
}
func (s *Service) Transfer(ctx context.Context, a domain.Actor, assetID string, in domain.TransferInput) (string, error) {
	if in.ToLocationID == "" || in.Reason == "" {
		return "", errors.New("toLocationId and reason are required")
	}
	var id string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		var from *string
		if err := tx.QueryRow(ctx, `SELECT location_id FROM assets.assets WHERE id=$1 AND organisation_id=$2 AND state IN('PURCHASED','AVAILABLE')FOR UPDATE`, assetID, a.OrganisationID).Scan(&from); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `INSERT INTO assets.transfers(organisation_id,asset_id,from_location_id,to_location_id,requested_by,transferred_by,reason,status,completed_at)VALUES($1,$2,$3,$4,$5,$5,$6,'COMPLETED',now())RETURNING id`, a.OrganisationID, assetID, from, in.ToLocationID, a.UserID, in.Reason).Scan(&id); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `UPDATE assets.assets SET location_id=$3,version=version+1,updated_at=now()WHERE id=$1 AND organisation_id=$2`, assetID, a.OrganisationID, in.ToLocationID); err != nil {
			return err
		}
		if err := repository.AppendHistory(ctx, tx, a, assetID, "asset.transferred", "", "", map[string]any{"transferId": id, "fromLocationId": from, "toLocationId": in.ToLocationID}); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, assetID, "asset.transferred", nil, in)
	})
	return id, err
}
func (s *Service) Assign(ctx context.Context, a domain.Actor, id string, in domain.AssignAsset) (string, error) {
	if in.EmployeeID == "" || in.Condition == "" {
		return "", errors.New("employeeId and condition are required")
	}
	var assignmentID string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		var state domain.State
		if err := tx.QueryRow(ctx, `SELECT state FROM assets.assets WHERE id=$1 AND organisation_id=$2 FOR UPDATE`, id, a.OrganisationID).Scan(&state); err != nil {
			return err
		}
		if err := domain.ValidateTransition(state, domain.Assigned); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `INSERT INTO assets.assignments(organisation_id,asset_id,employee_id,assigned_by,due_back_at,condition_out,accessories)SELECT $1,$2,id,$4,nullif($5,'')::timestamptz,$6,$7 FROM people.employees WHERE id=$3 AND organisation_id=$1 AND deleted_at IS NULL RETURNING id`, a.OrganisationID, id, in.EmployeeID, a.UserID, in.DueBackAt, in.Condition, in.Accessories).Scan(&assignmentID); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `UPDATE assets.assets SET state='ASSIGNED',version=version+1,updated_at=now()WHERE id=$1 AND organisation_id=$2`, id, a.OrganisationID); err != nil {
			return err
		}
		if err := repository.AppendHistory(ctx, tx, a, id, "asset.assigned", state, domain.Assigned, map[string]any{"assignmentId": assignmentID, "employeeId": in.EmployeeID}); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, id, "asset.assigned", map[string]any{"state": state}, in)
	})
	return assignmentID, err
}
func (s *Service) Accept(ctx context.Context, a domain.Actor, id, comment string) error {
	return s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		tag, err := tx.Exec(ctx, `UPDATE assets.assignments x SET status='ACTIVE',accepted_at=now(),acceptance_comment=$4 FROM people.employees e WHERE x.id=$1 AND x.organisation_id=$2 AND x.status='PENDING_ACCEPTANCE' AND e.id=x.employee_id AND e.user_id=$3`, id, a.OrganisationID, a.UserID, comment)
		if err != nil {
			return err
		}
		if tag.RowsAffected() != 1 {
			return errors.New("pending assignment not found")
		}
		var assetID string
		if err = tx.QueryRow(ctx, `SELECT asset_id FROM assets.assignments WHERE id=$1 AND organisation_id=$2`, id, a.OrganisationID).Scan(&assetID); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, assetID, "asset.assignment_accepted", nil, map[string]string{"assignmentId": id})
	})
}
func (s *Service) Return(ctx context.Context, a domain.Actor, assignmentID string, in domain.ReturnAsset) error {
	outcome := domain.State(in.Outcome)
	if outcome != domain.Available && outcome != domain.InRepair && outcome != domain.Lost && outcome != domain.Retired {
		return errors.New("invalid return outcome")
	}
	return s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		var assetID string
		var state domain.State
		if err := tx.QueryRow(ctx, `SELECT x.asset_id,a.state FROM assets.assignments x JOIN assets.assets a ON a.id=x.asset_id WHERE x.id=$1 AND x.organisation_id=$2 AND x.status IN('ACTIVE','RETURN_REQUESTED') FOR UPDATE`, assignmentID, a.OrganisationID).Scan(&assetID, &state); err != nil {
			return err
		}
		if err := domain.ValidateTransition(state, outcome); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `UPDATE assets.assignments SET status='RETURNED' WHERE id=$1;INSERT INTO assets.returns(organisation_id,assignment_id,received_by,received_at,condition_in,accessories_returned,inspection_notes,outcome)VALUES($2,$1,$3,now(),$4,$5,$6,$7);UPDATE assets.assets SET state=$7,version=version+1,updated_at=now()WHERE id=$8 AND organisation_id=$2`, assignmentID, a.OrganisationID, a.UserID, in.Condition, in.Accessories, in.InspectionNotes, outcome, assetID); err != nil {
			return err
		}
		if err := repository.AppendHistory(ctx, tx, a, assetID, "asset.returned", state, outcome, in); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, assetID, "asset.returned", map[string]any{"state": state}, in)
	})
}
func (s *Service) transition(ctx context.Context, a domain.Actor, id string, expected, next domain.State, event string, payload any) error {
	return s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		var state domain.State
		if err := tx.QueryRow(ctx, `SELECT state FROM assets.assets WHERE id=$1 AND organisation_id=$2 FOR UPDATE`, id, a.OrganisationID).Scan(&state); err != nil {
			return err
		}
		if state != expected {
			return errors.New("asset is not in the expected state")
		}
		if err := domain.ValidateTransition(state, next); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `UPDATE assets.assets SET state=$3,version=version+1,updated_at=now()WHERE id=$1 AND organisation_id=$2`, id, a.OrganisationID, next); err != nil {
			return err
		}
		if err := repository.AppendHistory(ctx, tx, a, id, event, state, next, payload); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, id, event, map[string]any{"state": state}, map[string]any{"state": next})
	})
}
