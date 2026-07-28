package domain

import "math"

type Actor struct {
	UserID, OrganisationID, RequestID, IP string
	Permissions                           map[string]bool
}
type CourseInput struct {
	CategoryID, Code, Title, Summary, Description, Level string
	DurationMinutes                                      int
	Compliance, CertificateEnabled                       bool
	CertificateValidityMonths                            *int
	PassingScore                                         *float64
}
type EnrollmentInput struct {
	CourseID, EmployeeID, AssignmentSource string
	SourceID, DueAt                        *string
}
type LessonUpdate struct {
	ProgressPercent       float64
	ResumePositionSeconds int
}
type ModuleInput struct {
	Title, Description string
	Position           int
}
type LessonInput struct {
	Title, LessonType         string
	Content                   map[string]any
	DocumentID                *string
	DurationMinutes, Position int
	Required                  bool
}

func Progress(completed, required int) float64 {
	if required <= 0 {
		return 100
	}
	value := float64(completed) * 100 / float64(required)
	return math.Round(math.Min(100, math.Max(0, value))*100) / 100
}
func Completed(progress float64) bool { return progress >= 100 }
