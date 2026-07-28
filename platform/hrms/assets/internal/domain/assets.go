package domain

import "errors"

type State string

const (
	Purchased State = "PURCHASED"
	Available State = "AVAILABLE"
	Assigned  State = "ASSIGNED"
	InRepair  State = "IN_REPAIR"
	Lost      State = "LOST"
	Retired   State = "RETIRED"
	Disposed  State = "DISPOSED"
)

func CanTransition(from, to State) bool {
	allowed := map[State]map[State]bool{
		Purchased: {Available: true, Retired: true}, Available: {Assigned: true, InRepair: true, Retired: true, Lost: true},
		Assigned: {Available: true, InRepair: true, Lost: true}, InRepair: {Available: true, Retired: true},
		Lost: {Available: true, Disposed: true}, Retired: {Disposed: true},
	}
	return allowed[from][to]
}
func ValidateTransition(from, to State) error {
	if !CanTransition(from, to) {
		return errors.New("invalid asset lifecycle transition")
	}
	return nil
}

type Actor struct {
	UserID, OrganisationID, RequestID, IP string
	Permissions                           map[string]bool
}
type CreateAsset struct {
	CategoryID, AssetCode, Name                                                                                                           string
	Description, Manufacturer, Model, SerialNumber, VendorID, LocationID, PurchaseDate, Currency, WarrantyExpiresAt, ProcurementReference string
	PurchaseCost                                                                                                                          *float64
	Metadata                                                                                                                              map[string]any
}
type AssignAsset struct {
	EmployeeID, Condition string
	Accessories           any
	DueBackAt             *string
}
type ReturnAsset struct {
	Condition, InspectionNotes, Outcome string
	Accessories                         any
}
type AssetRequest struct {
	CategoryID, Reason string
	Specification      map[string]any
}
type RepairInput struct {
	VendorID, Notes, Currency string
	Cost                      *float64
	WarrantyClaim             bool
}
type TransferInput struct{ ToLocationID, Reason string }
