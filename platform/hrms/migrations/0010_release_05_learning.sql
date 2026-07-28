BEGIN;
CREATE SCHEMA IF NOT EXISTS learning;
CREATE TABLE learning.course_categories(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,name text NOT NULL,description text,
 parent_id uuid REFERENCES learning.course_categories(id),status people.record_status NOT NULL DEFAULT 'active',
 created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(organisation_id,name)
);
CREATE TABLE learning.courses(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,category_id uuid REFERENCES learning.course_categories(id),
 code text NOT NULL,title text NOT NULL,summary text,description text,level text,duration_minutes integer NOT NULL DEFAULT 0,
 status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN('DRAFT','PUBLISHED','ARCHIVED')),compliance boolean NOT NULL DEFAULT false,
 certificate_enabled boolean NOT NULL DEFAULT true,certificate_validity_months integer,passing_score numeric(5,2),
 thumbnail_document_id uuid REFERENCES documents.documents(id),version integer NOT NULL DEFAULT 1,
 created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 published_at timestamptz,UNIQUE(organisation_id,code)
);
CREATE TABLE learning.course_modules(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,course_id uuid NOT NULL REFERENCES learning.courses(id),
 title text NOT NULL,description text,position integer NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(course_id,position)
);
CREATE TABLE learning.course_lessons(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,module_id uuid NOT NULL REFERENCES learning.course_modules(id),
 title text NOT NULL,lesson_type text NOT NULL CHECK(lesson_type IN('VIDEO','PDF','DOCUMENT','EXTERNAL_LINK','SCORM','MARKDOWN','RICH_TEXT')),
 content jsonb NOT NULL DEFAULT '{}',document_id uuid REFERENCES documents.documents(id),duration_minutes integer NOT NULL DEFAULT 0,
 position integer NOT NULL,required boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(module_id,position)
);
CREATE TABLE learning.paths(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,name text NOT NULL,description text,
 status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN('DRAFT','PUBLISHED','ARCHIVED')),created_by uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),published_at timestamptz,UNIQUE(organisation_id,name)
);
CREATE TABLE learning.path_courses(
 organisation_id uuid NOT NULL,path_id uuid NOT NULL REFERENCES learning.paths(id),course_id uuid NOT NULL REFERENCES learning.courses(id),
 position integer NOT NULL,required boolean NOT NULL DEFAULT true,PRIMARY KEY(path_id,course_id),UNIQUE(path_id,position)
);
CREATE TABLE learning.enrollments(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,course_id uuid NOT NULL REFERENCES learning.courses(id),
 employee_id uuid NOT NULL REFERENCES people.employees(id),assigned_by uuid NOT NULL,assignment_source text NOT NULL,
 source_id uuid,due_at timestamptz,status text NOT NULL DEFAULT 'NOT_STARTED'
  CHECK(status IN('NOT_STARTED','IN_PROGRESS','COMPLETED','OVERDUE','CANCELLED')),
 progress_percent numeric(5,2) NOT NULL DEFAULT 0,started_at timestamptz,completed_at timestamptz,last_activity_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),UNIQUE NULLS NOT DISTINCT(course_id,employee_id,assignment_source,source_id)
);
CREATE INDEX learning_enrollment_employee_idx ON learning.enrollments(organisation_id,employee_id,status,due_at);
CREATE TABLE learning.lesson_progress(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,enrollment_id uuid NOT NULL REFERENCES learning.enrollments(id),
 lesson_id uuid NOT NULL REFERENCES learning.course_lessons(id),status text NOT NULL DEFAULT 'NOT_STARTED'
  CHECK(status IN('NOT_STARTED','IN_PROGRESS','COMPLETED')),progress_percent numeric(5,2) NOT NULL DEFAULT 0,
 resume_position_seconds integer NOT NULL DEFAULT 0,started_at timestamptz,completed_at timestamptz,updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(enrollment_id,lesson_id)
);
CREATE TABLE learning.course_progress(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,enrollment_id uuid NOT NULL UNIQUE REFERENCES learning.enrollments(id),
 required_lessons integer NOT NULL DEFAULT 0,completed_lessons integer NOT NULL DEFAULT 0,progress_percent numeric(5,2) NOT NULL DEFAULT 0,
 assessment_score numeric(5,2),passed boolean,calculated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE learning.assessments(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,course_id uuid NOT NULL REFERENCES learning.courses(id),
 title text NOT NULL,instructions text,passing_score numeric(5,2) NOT NULL,attempt_limit integer,time_limit_minutes integer,
 randomise_questions boolean NOT NULL DEFAULT false,status people.record_status NOT NULL DEFAULT 'active',created_by uuid NOT NULL
);
CREATE TABLE learning.questions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,assessment_id uuid NOT NULL REFERENCES learning.assessments(id),
 question_type text NOT NULL CHECK(question_type IN('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','TEXT')),
 prompt text NOT NULL,points numeric(8,2) NOT NULL DEFAULT 1,position integer NOT NULL,metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE learning.answers(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,question_id uuid NOT NULL REFERENCES learning.questions(id),
 answer_text text NOT NULL,is_correct boolean NOT NULL DEFAULT false,position integer NOT NULL
);
CREATE TABLE learning.assessment_attempts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,enrollment_id uuid NOT NULL REFERENCES learning.enrollments(id),
 assessment_id uuid NOT NULL REFERENCES learning.assessments(id),attempt integer NOT NULL,answers jsonb NOT NULL DEFAULT '{}',
 score numeric(5,2),passed boolean,started_at timestamptz NOT NULL DEFAULT now(),submitted_at timestamptz,
 graded_by uuid,UNIQUE(enrollment_id,assessment_id,attempt)
);
CREATE TABLE learning.certificates(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,enrollment_id uuid NOT NULL UNIQUE REFERENCES learning.enrollments(id),
 employee_id uuid NOT NULL REFERENCES people.employees(id),course_id uuid NOT NULL REFERENCES learning.courses(id),
 verification_id text NOT NULL UNIQUE,document_id uuid REFERENCES documents.documents(id),issued_at timestamptz NOT NULL DEFAULT now(),
 expires_at date,status text NOT NULL DEFAULT 'ISSUED' CHECK(status IN('ISSUED','EXPIRED','REVOKED')),
 issued_by uuid NOT NULL
);
CREATE TABLE learning.mandatory_learning(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,course_id uuid REFERENCES learning.courses(id),
 path_id uuid REFERENCES learning.paths(id),department_id uuid REFERENCES people.departments(id),role_id uuid REFERENCES identity.roles(id),
 location text,employment_type text,joining_event boolean NOT NULL DEFAULT false,due_days integer,
 effective_from date NOT NULL,effective_to date,created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),
 CHECK((course_id IS NOT NULL)::integer+(path_id IS NOT NULL)::integer=1)
);
CREATE TABLE learning.history(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,enrollment_id uuid NOT NULL REFERENCES learning.enrollments(id),
 event_type text NOT NULL,actor_user_id uuid NOT NULL,payload jsonb NOT NULL DEFAULT '{}',request_id uuid NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER learning_history_immutable BEFORE UPDATE OR DELETE ON learning.history FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();
CREATE TABLE learning.outbox(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,topic text NOT NULL,payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),published_at timestamptz,attempts integer NOT NULL DEFAULT 0,last_error text
);
CREATE INDEX learning_outbox_pending_idx ON learning.outbox(created_at)WHERE published_at IS NULL;
CREATE TABLE learning.reminder_runs(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,run_date date NOT NULL,operation text NOT NULL,
 status text NOT NULL,processed integer NOT NULL DEFAULT 0,failed integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz,UNIQUE(organisation_id,run_date,operation)
);
INSERT INTO identity.permissions(key,description)VALUES
('learning.view','View and complete assigned learning'),('learning.manage','Manage learning catalog'),
('learning.assign','Assign learning'),('learning.grade','Grade assessments')
ON CONFLICT(key)DO UPDATE SET description=excluded.description;
INSERT INTO identity.role_permissions(role_id,permission_id)SELECT r.id,p.id FROM identity.roles r CROSS JOIN identity.permissions p
WHERE r.name='Owner' AND p.key LIKE 'learning.%' ON CONFLICT DO NOTHING;
COMMIT;
