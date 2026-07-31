-- Release 11: Careers Candidate Application System & Talent Intelligence Platform
CREATE SCHEMA IF NOT EXISTS recruitment;

-- 1. Candidates table
CREATE TABLE IF NOT EXISTS recruitment.candidates (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('cand_' || gen_random_uuid()::text),
    organisation_id VARCHAR(128) NOT NULL DEFAULT 'org_default',
    google_id VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    profile_picture_url TEXT,
    phone_number VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    time_zone VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Candidate Profiles table
CREATE TABLE IF NOT EXISTS recruitment.candidate_profiles (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('prof_' || gen_random_uuid()::text),
    candidate_id VARCHAR(128) NOT NULL,
    organisation_id VARCHAR(128) NOT NULL DEFAULT 'org_default',
    current_company VARCHAR(255),
    current_role VARCHAR(255),
    experience_years NUMERIC(4, 1) DEFAULT 0.0,
    notice_period_days INT DEFAULT 0,
    current_salary NUMERIC(12, 2) DEFAULT 0.0,
    expected_salary NUMERIC(12, 2) DEFAULT 0.0,
    work_authorization VARCHAR(100) DEFAULT 'Authorized',
    preferred_locations TEXT[],
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    behance_url TEXT,
    dribbble_url TEXT,
    medium_url TEXT,
    personal_website_url TEXT,
    bio TEXT,
    skills TEXT[],
    education JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Candidate Resumes table
CREATE TABLE IF NOT EXISTS recruitment.candidate_resumes (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('res_' || gen_random_uuid()::text),
    candidate_id VARCHAR(128) NOT NULL,
    organisation_id VARCHAR(128) NOT NULL DEFAULT 'org_default',
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    size_bytes BIGINT NOT NULL DEFAULT 0,
    storage_path TEXT NOT NULL,
    file_hash VARCHAR(64),
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Candidate Resume Versions table
CREATE TABLE IF NOT EXISTS recruitment.candidate_resume_versions (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('rver_' || gen_random_uuid()::text),
    resume_id VARCHAR(128) NOT NULL,
    candidate_id VARCHAR(128) NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    storage_path TEXT NOT NULL,
    parsed_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Job Applications table
CREATE TABLE IF NOT EXISTS recruitment.job_applications (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('app_' || gen_random_uuid()::text),
    job_id VARCHAR(128) NOT NULL,
    candidate_id VARCHAR(128) NOT NULL,
    organisation_id VARCHAR(128) NOT NULL DEFAULT 'org_default',
    requisition_id VARCHAR(128),
    status VARCHAR(50) NOT NULL DEFAULT 'applied',
    current_stage_key VARCHAR(50) NOT NULL DEFAULT 'applied',
    cover_letter TEXT,
    source VARCHAR(100) NOT NULL DEFAULT 'Careers Portal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Application Answers table
CREATE TABLE IF NOT EXISTS recruitment.application_answers (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('ans_' || gen_random_uuid()::text),
    application_id VARCHAR(128) NOT NULL,
    question_id VARCHAR(128) NOT NULL,
    question_text TEXT NOT NULL,
    answer_type VARCHAR(50) NOT NULL DEFAULT 'short_answer',
    answer_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Application Status History table
CREATE TABLE IF NOT EXISTS recruitment.application_status_history (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('hist_' || gen_random_uuid()::text),
    application_id VARCHAR(128) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id VARCHAR(128),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Interviews table
CREATE TABLE IF NOT EXISTS recruitment.interviews (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('int_' || gen_random_uuid()::text),
    application_id VARCHAR(128) NOT NULL,
    candidate_id VARCHAR(128) NOT NULL,
    organisation_id VARCHAR(128) NOT NULL DEFAULT 'org_default',
    title VARCHAR(255) NOT NULL,
    stage VARCHAR(100) NOT NULL DEFAULT 'Screening',
    scheduled_at TIMESTAMPTZ,
    duration_minutes INT DEFAULT 45,
    meeting_link TEXT,
    interviewer_user_ids TEXT[],
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Offers table
CREATE TABLE IF NOT EXISTS recruitment.offers (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('off_' || gen_random_uuid()::text),
    application_id VARCHAR(128) NOT NULL,
    candidate_id VARCHAR(128) NOT NULL,
    organisation_id VARCHAR(128) NOT NULL DEFAULT 'org_default',
    salary_offered NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    start_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    offer_letter_document_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Candidate Notes table
CREATE TABLE IF NOT EXISTS recruitment.candidate_notes (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('note_' || gen_random_uuid()::text),
    candidate_id VARCHAR(128) NOT NULL,
    author_user_id VARCHAR(128) NOT NULL,
    note_text TEXT NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Candidate Documents table
CREATE TABLE IF NOT EXISTS recruitment.candidate_documents (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('doc_' || gen_random_uuid()::text),
    candidate_id VARCHAR(128) NOT NULL,
    document_type VARCHAR(100) NOT NULL DEFAULT 'resume',
    name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Resume AI Analysis table
CREATE TABLE IF NOT EXISTS recruitment.resume_ai_analysis (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('ai_' || gen_random_uuid()::text),
    candidate_id VARCHAR(128) NOT NULL,
    application_id VARCHAR(128),
    resume_id VARCHAR(128),
    summary TEXT,
    match_score INT NOT NULL DEFAULT 85,
    skill_match INT NOT NULL DEFAULT 90,
    experience_match INT NOT NULL DEFAULT 80,
    missing_skills TEXT[],
    strengths TEXT[],
    weaknesses TEXT[],
    interview_questions TEXT[],
    role_fit VARCHAR(100) DEFAULT 'High Potential',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Candidate Activity Timeline table
CREATE TABLE IF NOT EXISTS recruitment.candidate_activity (
    id VARCHAR(128) PRIMARY KEY DEFAULT ('act_' || gen_random_uuid()::text),
    candidate_id VARCHAR(128) NOT NULL,
    application_id VARCHAR(128),
    activity_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
