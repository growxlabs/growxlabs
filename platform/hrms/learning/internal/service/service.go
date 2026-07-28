package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"github.com/jackc/pgx/v5"
	"growx/hrms/learning/internal/domain"
	"growx/hrms/learning/internal/repository"
)

type Service struct{ Repo *repository.Repository }

func New(repo *repository.Repository) *Service { return &Service{Repo: repo} }
func (s *Service) CreateCourse(ctx context.Context, a domain.Actor, in domain.CourseInput) (string, error) {
	if in.Code == "" || in.Title == "" {
		return "", errors.New("code and title are required")
	}
	var id string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `INSERT INTO learning.courses(organisation_id,category_id,code,title,summary,description,level,duration_minutes,compliance,certificate_enabled,certificate_validity_months,passing_score,created_by)VALUES($1,nullif($2,'')::uuid,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)RETURNING id`, a.OrganisationID, in.CategoryID, in.Code, in.Title, in.Summary, in.Description, in.Level, in.DurationMinutes, in.Compliance, in.CertificateEnabled, in.CertificateValidityMonths, in.PassingScore, a.UserID).Scan(&id); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, "course", id, "learning.course_created", in)
	})
	return id, err
}
func (s *Service) Publish(ctx context.Context, a domain.Actor, id string) error {
	return s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		tag, err := tx.Exec(ctx, `UPDATE learning.courses SET status='PUBLISHED',published_at=now(),version=version+1,updated_at=now()WHERE id=$1 AND organisation_id=$2 AND status='DRAFT'`, id, a.OrganisationID)
		if err != nil {
			return err
		}
		if tag.RowsAffected() != 1 {
			return errors.New("draft course not found")
		}
		return repository.AuditOutbox(ctx, tx, a, "course", id, "learning.course_published", map[string]string{"status": "PUBLISHED"})
	})
}
func (s *Service) AddModule(ctx context.Context, a domain.Actor, courseID string, in domain.ModuleInput) (string, error) {
	if in.Title == "" || in.Position < 1 {
		return "", errors.New("title and positive position are required")
	}
	var id string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `INSERT INTO learning.course_modules(organisation_id,course_id,title,description,position) SELECT $1,id,$3,$4,$5 FROM learning.courses WHERE id=$2 AND organisation_id=$1 AND status='DRAFT' RETURNING id`, a.OrganisationID, courseID, in.Title, in.Description, in.Position).Scan(&id); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, "course_module", id, "learning.module_created", map[string]any{"courseId": courseID, "moduleId": id})
	})
	return id, err
}
func (s *Service) AddLesson(ctx context.Context, a domain.Actor, moduleID string, in domain.LessonInput) (string, error) {
	allowed := map[string]bool{"VIDEO": true, "PDF": true, "DOCUMENT": true, "EXTERNAL_LINK": true, "SCORM": true, "MARKDOWN": true, "RICH_TEXT": true}
	if in.Title == "" || !allowed[in.LessonType] || in.Position < 1 {
		return "", errors.New("valid title, lessonType and position are required")
	}
	var id string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `INSERT INTO learning.course_lessons(organisation_id,module_id,title,lesson_type,content,document_id,duration_minutes,position,required) SELECT $1,m.id,$3,$4,$5,$6,$7,$8,$9 FROM learning.course_modules m JOIN learning.courses c ON c.id=m.course_id WHERE m.id=$2 AND m.organisation_id=$1 AND c.status='DRAFT' RETURNING id`, a.OrganisationID, moduleID, in.Title, in.LessonType, in.Content, in.DocumentID, in.DurationMinutes, in.Position, in.Required).Scan(&id); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, "course_lesson", id, "learning.lesson_created", map[string]any{"moduleId": moduleID, "lessonId": id})
	})
	return id, err
}
func (s *Service) Enroll(ctx context.Context, a domain.Actor, in domain.EnrollmentInput) (string, error) {
	if in.CourseID == "" || in.EmployeeID == "" {
		return "", errors.New("courseId and employeeId are required")
	}
	if in.AssignmentSource == "" {
		in.AssignmentSource = "MANAGER"
	}
	var id string
	err := s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `INSERT INTO learning.enrollments(organisation_id,course_id,employee_id,assigned_by,assignment_source,source_id,due_at)SELECT $1,c.id,e.id,$4,$5,nullif($6,'')::uuid,nullif($7,'')::timestamptz FROM learning.courses c,people.employees e WHERE c.id=$2 AND c.organisation_id=$1 AND c.status='PUBLISHED' AND e.id=$3 AND e.organisation_id=$1 AND e.deleted_at IS NULL ON CONFLICT(course_id,employee_id,assignment_source,source_id)DO UPDATE SET due_at=excluded.due_at RETURNING id`, a.OrganisationID, in.CourseID, in.EmployeeID, a.UserID, in.AssignmentSource, in.SourceID, in.DueAt).Scan(&id); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `INSERT INTO learning.lesson_progress(organisation_id,enrollment_id,lesson_id)SELECT $1,$2,l.id FROM learning.course_lessons l JOIN learning.course_modules m ON m.id=l.module_id WHERE m.course_id=$3 ON CONFLICT DO NOTHING;INSERT INTO learning.course_progress(organisation_id,enrollment_id,required_lessons)SELECT $1,$2,count(*)FILTER(WHERE l.required)FROM learning.course_lessons l JOIN learning.course_modules m ON m.id=l.module_id WHERE m.course_id=$3 ON CONFLICT(enrollment_id)DO NOTHING`, a.OrganisationID, id, in.CourseID); err != nil {
			return err
		}
		if err := repository.History(ctx, tx, a, id, "learning.enrolled", in); err != nil {
			return err
		}
		return repository.AuditOutbox(ctx, tx, a, "enrollment", id, "learning.enrolled", map[string]any{"enrollmentId": id, "employeeId": in.EmployeeID, "courseId": in.CourseID})
	})
	return id, err
}
func (s *Service) UpdateLesson(ctx context.Context, a domain.Actor, enrollmentID, lessonID string, in domain.LessonUpdate) error {
	if in.ProgressPercent < 0 || in.ProgressPercent > 100 {
		return errors.New("progress must be between 0 and 100")
	}
	return s.Repo.Tx(ctx, func(tx pgx.Tx) error {
		var employeeID, courseID string
		err := tx.QueryRow(ctx, `SELECT e.employee_id,e.course_id FROM learning.enrollments e JOIN people.employees p ON p.id=e.employee_id WHERE e.id=$1 AND e.organisation_id=$2 AND p.user_id=$3 FOR UPDATE`, enrollmentID, a.OrganisationID, a.UserID).Scan(&employeeID, &courseID)
		if err != nil {
			return err
		}
		status := "IN_PROGRESS"
		if domain.Completed(in.ProgressPercent) {
			status = "COMPLETED"
		}
		tag, err := tx.Exec(ctx, `UPDATE learning.lesson_progress SET progress_percent=$4,resume_position_seconds=$5,status=$6,started_at=coalesce(started_at,now()),completed_at=CASE WHEN $6='COMPLETED'THEN coalesce(completed_at,now())ELSE NULL END,updated_at=now()WHERE enrollment_id=$1 AND lesson_id=$2 AND organisation_id=$3`, enrollmentID, lessonID, a.OrganisationID, in.ProgressPercent, in.ResumePositionSeconds, status)
		if err != nil {
			return err
		}
		if tag.RowsAffected() != 1 {
			return errors.New("lesson enrollment not found")
		}
		var required, completed int
		if err = tx.QueryRow(ctx, `SELECT count(*)FILTER(WHERE l.required),count(*)FILTER(WHERE l.required AND p.status='COMPLETED')FROM learning.lesson_progress p JOIN learning.course_lessons l ON l.id=p.lesson_id WHERE p.enrollment_id=$1`, enrollmentID).Scan(&required, &completed); err != nil {
			return err
		}
		progress := domain.Progress(completed, required)
		if _, err = tx.Exec(ctx, `UPDATE learning.course_progress SET required_lessons=$2,completed_lessons=$3,progress_percent=$4,calculated_at=now()WHERE enrollment_id=$1;UPDATE learning.enrollments SET progress_percent=$4,status=CASE WHEN $4>=100 THEN 'COMPLETED' ELSE 'IN_PROGRESS' END,started_at=coalesce(started_at,now()),completed_at=CASE WHEN $4>=100 THEN coalesce(completed_at,now()) ELSE NULL END,last_activity_at=now()WHERE id=$1`, enrollmentID, required, completed, progress); err != nil {
			return err
		}
		if domain.Completed(progress) {
			var enabled bool
			var validity *int
			if err = tx.QueryRow(ctx, `SELECT certificate_enabled,certificate_validity_months FROM learning.courses WHERE id=$1`, courseID).Scan(&enabled, &validity); err != nil {
				return err
			}
			if enabled {
				verification := verificationID()
				_, err = tx.Exec(ctx, `INSERT INTO learning.certificates(organisation_id,enrollment_id,employee_id,course_id,verification_id,expires_at,issued_by)VALUES($1,$2,$3,$4,$5,CASE WHEN $6::integer IS NULL THEN NULL ELSE(current_date+($6||' months')::interval)::date END,$7)ON CONFLICT(enrollment_id)DO NOTHING`, a.OrganisationID, enrollmentID, employeeID, courseID, verification, validity, a.UserID)
				if err != nil {
					return err
				}
			}
		}
		if err = repository.History(ctx, tx, a, enrollmentID, "learning.progress_updated", map[string]any{"lessonId": lessonID, "progressPercent": progress}); err != nil {
			return err
		}
		topic := "learning.progress_updated"
		if domain.Completed(progress) {
			topic = "learning.course_completed"
		}
		return repository.AuditOutbox(ctx, tx, a, "enrollment", enrollmentID, topic, map[string]any{"enrollmentId": enrollmentID, "courseId": courseID, "employeeId": employeeID, "progressPercent": progress})
	})
}
func verificationID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return "GXL-" + hex.EncodeToString(b)
}
