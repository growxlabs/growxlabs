package main

import "time"

type PerformanceConfig struct {
	ID                          string    `json:"id"`
	OrganisationID              string    `json:"organisation_id"`
	RatingScaleType             string    `json:"rating_scale_type"`             // 3_point, 5_point, 7_point, 10_point
	CalibrationDistributionType string    `json:"calibration_distribution_type"` // nine_box, forced, bell_curve
	CreatedAt                   time.Time `json:"created_at"`
	UpdatedAt                   time.Time `json:"updated_at"`
}

type Goal struct {
	ID              string     `json:"id"`
	OrganisationID  string     `json:"organisation_id"`
	DepartmentID    string     `json:"department_id,omitempty"`
	EmployeeID      string     `json:"employee_id"`
	ParentGoalID    string     `json:"parent_goal_id,omitempty"`
	GoalType        string     `json:"goal_type"` // okr, kpi, kra, business, department, project, personal
	CycleType       string     `json:"cycle_type"`
	CycleCode       string     `json:"cycle_code"`
	Title           string     `json:"title"`
	Description     string     `json:"description,omitempty"`
	Weightage       float64    `json:"weightage"`
	Status          string     `json:"status"` // draft, active, on_track, at_risk, completed, cancelled
	ProgressPercent int        `json:"progress_percent"`
	DueDate         *time.Time `json:"due_date,omitempty"`
	CreatedByID     string     `json:"created_by_id"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type ReviewCycle struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	Name           string    `json:"name"`
	CycleType      string    `json:"cycle_type"` // annual, quarterly, probation, promotion, confirmation, custom
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	DueDate        time.Time `json:"due_date"`
	Status         string    `json:"status"` // draft, active, locked, completed
	CreatedAt      time.Time `json:"created_at"`
}

type PerformanceReview struct {
	ID              string     `json:"id"`
	Version         int        `json:"version"`
	OrganisationID  string     `json:"organisation_id"`
	ReviewCycleID   string     `json:"review_cycle_id"`
	EmployeeID      string     `json:"employee_id"`
	ManagerID       string     `json:"manager_id"`
	Status          string     `json:"status"` // self_review, manager_review, hr_review, leadership_review, calibrated, completed
	OverallRating   *float64   `json:"overall_rating,omitempty"`
	SummaryComments string     `json:"summary_comments,omitempty"`
	SubmittedAt     *time.Time `json:"submitted_at,omitempty"`
	ApprovedAt      *time.Time `json:"approved_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type Feedback360 struct {
	ID                string     `json:"id"`
	ReviewID          string     `json:"review_id"`
	SubjectEmployeeID string     `json:"subject_employee_id"`
	ReviewerID        string     `json:"reviewer_id"`
	Relationship      string     `json:"relationship"` // peer, direct_report, manager, hr
	IsAnonymous       bool       `json:"is_anonymous"`
	RatingsJSON       string     `json:"ratings_json"`
	Comments          string     `json:"comments,omitempty"`
	Status            string     `json:"status"` // pending, submitted
	SubmittedAt       *time.Time `json:"submitted_at,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
}

type PIPPlan struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	EmployeeID     string    `json:"employee_id"`
	ManagerID      string    `json:"manager_id"`
	Reason         string    `json:"reason"`
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	Status         string    `json:"status"` // active, successful, unsuccessful, extended
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type RewardRecognition struct {
	ID                  string    `json:"id"`
	OrganisationID      string    `json:"organisation_id"`
	RecipientEmployeeID string    `json:"recipient_employee_id"`
	GiverEmployeeID     string    `json:"giver_employee_id"`
	RewardType          string    `json:"reward_type"` // appreciation, spot_award, badge, achievement, annual_award
	BadgeName           string    `json:"badge_name,omitempty"`
	PointsOrAmount      float64   `json:"points_or_amount"`
	Title               string    `json:"title"`
	Message             string    `json:"message"`
	CreatedAt           time.Time `json:"created_at"`
}

type PerformanceTimelineEvent struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	EmployeeID     string    `json:"employee_id"`
	EventType      string    `json:"event_type"`
	Title          string    `json:"title"`
	DetailsJSON    string    `json:"details_json"`
	OccurredAt     time.Time `json:"occurred_at"`
}
