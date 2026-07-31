-- Release 07 Migration: Learning, Development & Internal Mobility

-- 1. Learning Categories
CREATE TABLE IF NOT EXISTS hrms_learning_categories (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    code VARCHAR(64) NOT NULL DEFAULT '',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_learning_categories ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 2. Courses
CREATE TABLE IF NOT EXISTS hrms_courses (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    category_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT,
    course_type VARCHAR(32) NOT NULL DEFAULT 'optional',
    department_id VARCHAR(128),
    version INT NOT NULL DEFAULT 1,
    prerequisites_json JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_courses ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_courses ADD COLUMN IF NOT EXISTS category_id VARCHAR(128);

-- 3. Course Modules
CREATE TABLE IF NOT EXISTS hrms_course_modules (
    id VARCHAR(128) PRIMARY KEY,
    course_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    order_index INT NOT NULL DEFAULT 1
);
ALTER TABLE hrms_course_modules ADD COLUMN IF NOT EXISTS course_id VARCHAR(128);

-- 4. Course Lessons
CREATE TABLE IF NOT EXISTS hrms_course_lessons (
    id VARCHAR(128) PRIMARY KEY,
    module_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    content_type VARCHAR(32) NOT NULL DEFAULT 'video',
    media_url TEXT,
    duration_minutes INT NOT NULL DEFAULT 15,
    order_index INT NOT NULL DEFAULT 1
);
ALTER TABLE hrms_course_lessons ADD COLUMN IF NOT EXISTS module_id VARCHAR(128);

-- 5. Assessments
CREATE TABLE IF NOT EXISTS hrms_assessments (
    id VARCHAR(128) PRIMARY KEY,
    course_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    passing_score DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    time_limit_minutes INT NOT NULL DEFAULT 30,
    max_attempts INT NOT NULL DEFAULT 3,
    auto_evaluate BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER TABLE hrms_assessments ADD COLUMN IF NOT EXISTS course_id VARCHAR(128);

-- 6. Assessment Questions
CREATE TABLE IF NOT EXISTS hrms_assessment_questions (
    id VARCHAR(128) PRIMARY KEY,
    assessment_id VARCHAR(128),
    question_type VARCHAR(32) NOT NULL DEFAULT 'mcq',
    prompt TEXT NOT NULL DEFAULT '',
    options_json JSONB DEFAULT '[]'::jsonb,
    correct_answer TEXT,
    points DOUBLE PRECISION NOT NULL DEFAULT 10.0
);
ALTER TABLE hrms_assessment_questions ADD COLUMN IF NOT EXISTS assessment_id VARCHAR(128);

-- 7. Assessment Attempts
CREATE TABLE IF NOT EXISTS hrms_assessment_attempts (
    id VARCHAR(128) PRIMARY KEY,
    assessment_id VARCHAR(128),
    employee_id VARCHAR(128),
    score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    answers_json JSONB DEFAULT '{}'::jsonb,
    evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_assessment_attempts ADD COLUMN IF NOT EXISTS assessment_id VARCHAR(128);
ALTER TABLE hrms_assessment_attempts ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 8. Certifications
CREATE TABLE IF NOT EXISTS hrms_certifications (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    issuing_authority VARCHAR(255) NOT NULL DEFAULT '',
    certification_type VARCHAR(32) NOT NULL DEFAULT 'internal',
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    certificate_url TEXT,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_certifications ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_certifications ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 9. Skills & Employee Skill Matrix
CREATE TABLE IF NOT EXISTS hrms_skills (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    category VARCHAR(64) NOT NULL DEFAULT 'technical',
    code VARCHAR(64) NOT NULL DEFAULT ''
);
ALTER TABLE hrms_skills ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_employee_skills (
    id VARCHAR(128) PRIMARY KEY,
    employee_id VARCHAR(128),
    skill_id VARCHAR(128),
    proficiency_level INT NOT NULL DEFAULT 1,
    verified_by_id VARCHAR(128),
    verified_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE hrms_employee_skills ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);
ALTER TABLE hrms_employee_skills ADD COLUMN IF NOT EXISTS skill_id VARCHAR(128);

-- 10. Mentorship Programs
CREATE TABLE IF NOT EXISTS hrms_mentorship_programs (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    mentor_id VARCHAR(128),
    mentee_id VARCHAR(128),
    focus_area VARCHAR(255) NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE
);
ALTER TABLE hrms_mentorship_programs ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_mentorship_sessions (
    id VARCHAR(128) PRIMARY KEY,
    program_id VARCHAR(128),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    feedback TEXT
);
ALTER TABLE hrms_mentorship_sessions ADD COLUMN IF NOT EXISTS program_id VARCHAR(128);

-- 11. Instructor-Led Training Sessions
CREATE TABLE IF NOT EXISTS hrms_training_sessions (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    instructor_id VARCHAR(128),
    session_type VARCHAR(32) NOT NULL DEFAULT 'virtual',
    location_or_link TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    max_capacity INT NOT NULL DEFAULT 25
);
ALTER TABLE hrms_training_sessions ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 12. Internal Mobility & Talent Marketplace
CREATE TABLE IF NOT EXISTS hrms_internal_jobs (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    designation_id VARCHAR(128),
    department_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    requirements TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_internal_jobs ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_internal_applications (
    id VARCHAR(128) PRIMARY KEY,
    job_id VARCHAR(128),
    employee_id VARCHAR(128),
    current_manager_approval VARCHAR(32) NOT NULL DEFAULT 'pending',
    hr_status VARCHAR(32) NOT NULL DEFAULT 'applied',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_internal_applications ADD COLUMN IF NOT EXISTS job_id VARCHAR(128);
ALTER TABLE hrms_internal_applications ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 13. AI Learning Recommendations
CREATE TABLE IF NOT EXISTS hrms_ai_learning_recommendations (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    recommendation_type VARCHAR(64) NOT NULL DEFAULT 'course',
    payload_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_ai_learning_recommendations ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_ai_learning_recommendations ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);
