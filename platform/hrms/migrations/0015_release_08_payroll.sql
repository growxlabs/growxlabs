-- Release 08 Migration: Payroll, Compensation & Benefits

-- 1. Payroll Cycles & Processing
CREATE TABLE IF NOT EXISTS hrms_payroll_cycles (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    cycle_type VARCHAR(32) NOT NULL DEFAULT 'monthly',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    payout_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_payroll_cycles ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 2. Salary Templates & Components
CREATE TABLE IF NOT EXISTS hrms_salary_templates (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_salary_templates ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_salary_components (
    id VARCHAR(128) PRIMARY KEY,
    template_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    component_type VARCHAR(32) NOT NULL DEFAULT 'earning',
    calculation_type VARCHAR(32) NOT NULL DEFAULT 'fixed',
    amount_or_percent DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_taxable BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER TABLE hrms_salary_components ADD COLUMN IF NOT EXISTS template_id VARCHAR(128);

-- 3. Employee Salary Structures
CREATE TABLE IF NOT EXISTS hrms_employee_salary_structures (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    template_id VARCHAR(128),
    annual_ctc DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_employee_salary_structures ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_employee_salary_structures ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 4. Payslips
CREATE TABLE IF NOT EXISTS hrms_payslips (
    id VARCHAR(128) PRIMARY KEY,
    payroll_cycle_id VARCHAR(128),
    employee_id VARCHAR(128),
    gross_earnings DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_deductions DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    net_pay DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    breakdown_json JSONB DEFAULT '{}'::jsonb,
    pdf_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'generated',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_payslips ADD COLUMN IF NOT EXISTS payroll_cycle_id VARCHAR(128);
ALTER TABLE hrms_payslips ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 5. Statutory Compliance
CREATE TABLE IF NOT EXISTS hrms_statutory_configs (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    pf_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    pf_employee_percent DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    pf_employer_percent DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    esi_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    esi_employee_percent DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    esi_employer_percent DOUBLE PRECISION NOT NULL DEFAULT 3.25,
    tds_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    pt_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_statutory_configs ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 6. Reimbursements & Claims
CREATE TABLE IF NOT EXISTS hrms_reimbursement_claims (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    category VARCHAR(64) NOT NULL DEFAULT 'travel',
    amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    description TEXT,
    receipt_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    approved_by_id VARCHAR(128),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_reimbursement_claims ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_reimbursement_claims ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 7. Loans & Advances
CREATE TABLE IF NOT EXISTS hrms_employee_loans (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    loan_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tenure_months INT NOT NULL DEFAULT 12,
    monthly_emi DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    remaining_balance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_employee_loans ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_employee_loans ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 8. AI Payroll Insights
CREATE TABLE IF NOT EXISTS hrms_ai_payroll_insights (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    insight_type VARCHAR(64) NOT NULL DEFAULT 'anomaly',
    payload_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_ai_payroll_insights ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
