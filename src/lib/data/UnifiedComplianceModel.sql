-- ============================================================================
-- UNIFIED COMPLIANCE MODEL - SQL SCHEMA
-- Project Zero ESG & Sustainability Platform
-- ============================================================================
-- Supports: SB-253, CSRD (ESRS), CDP, TCFD, ISSB S1/S2
-- Database: PostgreSQL 14+
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    industry_code VARCHAR(50) NOT NULL,
    number_of_employees INTEGER NOT NULL,
    revenue DECIMAL(20, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    fiscal_year_end VARCHAR(10) NOT NULL,
    consolidation_approach VARCHAR(50) NOT NULL,
    organizational_boundary TEXT NOT NULL,

    -- Address
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_registration ON companies(registration_number);
CREATE INDEX idx_companies_industry ON companies(industry_code);

CREATE TABLE company_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_contacts_company ON company_contacts(company_id);

CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(50) NOT NULL,

    -- Address
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),

    -- Operational
    operational_status VARCHAR(20) DEFAULT 'active',
    start_date DATE,
    floor_area DECIMAL(15, 2),
    floor_area_unit VARCHAR(10) DEFAULT 'sqm',

    -- Energy
    egrid_subregion VARCHAR(10),
    grid_mix VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facilities_company ON facilities(company_id);
CREATE INDEX idx_facilities_country ON facilities(country);

-- ============================================================================
-- ACTIVITY DATA
-- ============================================================================

CREATE TABLE activity_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,

    -- Scope & Category
    scope INTEGER NOT NULL CHECK (scope IN (1, 2, 3)),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),

    -- Activity Amount
    activity_amount DECIMAL(20, 4) NOT NULL,
    activity_unit VARCHAR(50) NOT NULL,

    -- Time Period
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,

    -- Data Quality
    data_quality VARCHAR(50) NOT NULL,
    source VARCHAR(255) NOT NULL,
    source_reference VARCHAR(255),

    -- Location
    location VARCHAR(255),
    geography VARCHAR(100),

    -- Metadata
    notes TEXT,
    tags TEXT[],

    -- Upload Info
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP,
    upload_batch_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_data_company_scope ON activity_data(company_id, scope, period_start);
CREATE INDEX idx_activity_data_facility ON activity_data(facility_id);
CREATE INDEX idx_activity_data_category ON activity_data(category, scope);
CREATE INDEX idx_activity_data_period ON activity_data(period_start, period_end);

-- ============================================================================
-- EMISSION FACTORS
-- ============================================================================

CREATE TABLE emission_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factor_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL,
    version VARCHAR(50) NOT NULL,

    -- Scope & Category
    scope INTEGER NOT NULL CHECK (scope IN (1, 2, 3)),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),

    -- Factor Value
    factor DECIMAL(20, 8) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    gwp VARCHAR(10) DEFAULT 'AR5',

    -- Geographic Applicability
    geography VARCHAR(100),
    country VARCHAR(100),
    region VARCHAR(100),

    -- Temporal Applicability
    applicable_years INTEGER[],
    valid_from DATE,
    valid_to DATE,

    -- Quality
    uncertainty DECIMAL(5, 2),
    data_quality_rating VARCHAR(20),

    -- Metadata
    metadata JSONB,
    regulatory_ref VARCHAR(255),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_custom BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reviewed_at TIMESTAMP
);

CREATE INDEX idx_emission_factors_source ON emission_factors(source, scope, category);
CREATE INDEX idx_emission_factors_geography ON emission_factors(geography);
CREATE INDEX idx_emission_factors_active ON emission_factors(is_active, is_custom);

-- ============================================================================
-- CALCULATED EMISSIONS
-- ============================================================================

CREATE TABLE calculated_emissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    activity_data_id UUID NOT NULL REFERENCES activity_data(id) ON DELETE RESTRICT,
    emission_factor_id UUID NOT NULL REFERENCES emission_factors(id) ON DELETE RESTRICT,

    -- Scope & Category
    scope INTEGER NOT NULL CHECK (scope IN (1, 2, 3)),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),

    -- Result
    emission_amount DECIMAL(20, 4) NOT NULL,
    emission_unit VARCHAR(20) DEFAULT 'tons CO2e',

    -- Breakdown
    co2_amount DECIMAL(20, 4),
    ch4_amount DECIMAL(20, 4),
    n2o_amount DECIMAL(20, 4),
    other_ghg_amount DECIMAL(20, 4),

    -- Uncertainty
    uncertainty_lower DECIMAL(20, 4),
    uncertainty_upper DECIMAL(20, 4),

    -- Methodology
    methodology TEXT NOT NULL,
    formula TEXT NOT NULL,
    calculation_method VARCHAR(100) NOT NULL,

    -- Data Quality
    data_quality VARCHAR(50) NOT NULL,
    confidence_level VARCHAR(20),

    -- Traceability
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculated_by VARCHAR(255),
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,

    -- Status
    status VARCHAR(20) DEFAULT 'draft',

    -- Versioning
    version INTEGER DEFAULT 1,
    previous_version_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calculated_emissions_company ON calculated_emissions(company_id, scope, status);
CREATE INDEX idx_calculated_emissions_facility ON calculated_emissions(facility_id);
CREATE INDEX idx_calculated_emissions_activity ON calculated_emissions(activity_data_id);
CREATE INDEX idx_calculated_emissions_status ON calculated_emissions(status, approved_at);

-- ============================================================================
-- SUPPLY CHAIN DATA
-- ============================================================================

CREATE TABLE supply_chain_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,

    -- Supplier Info
    supplier_name VARCHAR(255) NOT NULL,
    supplier_category VARCHAR(100) NOT NULL,
    supplier_tier INTEGER NOT NULL,
    supplier_country VARCHAR(100),

    -- Spend & Volume
    annual_spend DECIMAL(20, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    product_category VARCHAR(255),
    volume DECIMAL(20, 4),
    volume_unit VARCHAR(50),

    -- Emissions Data
    scope3_category VARCHAR(100) NOT NULL,
    supplier_emissions DECIMAL(20, 4),
    emission_intensity DECIMAL(20, 8),

    -- Engagement
    has_set_sbt BOOLEAN DEFAULT FALSE,
    cdp_score VARCHAR(5),
    sustainability_rating VARCHAR(20),

    -- Period
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,

    -- Metadata
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supply_chain_company ON supply_chain_data(company_id, scope3_category);

-- ============================================================================
-- WORKFORCE DATA
-- ============================================================================

CREATE TABLE workforce_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    facility_id UUID REFERENCES facilities(id),

    -- Period
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,

    -- Employee Counts
    total_employees INTEGER NOT NULL,
    full_time_employees INTEGER,
    part_time_employees INTEGER,
    contractor_count INTEGER,

    -- Demographics
    female_employees INTEGER,
    male_employees INTEGER,
    non_binary_employees INTEGER,

    -- Safety & Training
    recordable_incidents INTEGER,
    lost_time_incidents INTEGER,
    training_hours_total DECIMAL(15, 2),

    -- Commuting
    average_commute_distance DECIMAL(10, 2),
    commute_distance_unit VARCHAR(10) DEFAULT 'km',
    remote_work_percentage DECIMAL(5, 2),

    -- Travel
    business_travel_km DECIMAL(15, 2),
    business_flights_short INTEGER,
    business_flights_medium INTEGER,
    business_flights_long INTEGER,
    hotel_nights INTEGER,

    -- Metadata
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workforce_data_company ON workforce_data(company_id, period_start);

-- ============================================================================
-- FINANCIAL DATA
-- ============================================================================

CREATE TABLE financial_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,

    -- Period
    fiscal_year INTEGER NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,

    -- Revenue & Costs
    total_revenue DECIMAL(20, 2) NOT NULL,
    operating_costs DECIMAL(20, 2),
    capital_expenditures DECIMAL(20, 2),
    currency VARCHAR(3) DEFAULT 'USD',

    -- Climate-Related Financial Data
    climate_related_capex DECIMAL(20, 2),
    climate_related_opex DECIMAL(20, 2),
    carbon_credits_expense DECIMAL(20, 2),

    -- Risk Exposure
    carbon_price_exposure DECIMAL(20, 2),
    physical_risk_exposure DECIMAL(20, 2),
    transition_risk_exposure DECIMAL(20, 2),

    -- Green Revenue
    low_carbon_revenue DECIMAL(20, 2),
    low_carbon_revenue_percentage DECIMAL(5, 2),

    -- Metadata
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_data_company ON financial_data(company_id, fiscal_year);

-- ============================================================================
-- MATERIALITY ASSESSMENT
-- ============================================================================

CREATE TABLE materiality_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Assessment Info
    assessment_year INTEGER NOT NULL,
    assessment_date TIMESTAMP NOT NULL,
    methodology TEXT NOT NULL,

    -- Stakeholder Engagement
    stakeholders_engaged TEXT[],
    engagement_method TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materiality_assessments_company ON materiality_assessments(company_id);

CREATE TABLE materiality_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES materiality_assessments(id) ON DELETE CASCADE,

    -- Topic
    topic_name VARCHAR(255) NOT NULL,
    topic_code VARCHAR(50),
    category VARCHAR(50) NOT NULL,

    -- Impact Materiality
    impact_score INTEGER NOT NULL CHECK (impact_score BETWEEN 1 AND 5),
    impact_rationale TEXT NOT NULL,
    impact_stakeholders TEXT[],

    -- Financial Materiality
    financial_score INTEGER NOT NULL CHECK (financial_score BETWEEN 1 AND 5),
    financial_rationale TEXT NOT NULL,
    financial_time_horizon VARCHAR(20) NOT NULL,

    -- Overall
    overall_materiality VARCHAR(20) NOT NULL,
    disclosure_required BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materiality_topics_assessment ON materiality_topics(assessment_id);

-- ============================================================================
-- GENERATED REPORTS
-- ============================================================================

CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Framework
    framework_id VARCHAR(50) NOT NULL,
    framework_version VARCHAR(50) NOT NULL,

    -- Report Info
    report_name VARCHAR(255) NOT NULL,
    report_period_start TIMESTAMP NOT NULL,
    report_period_end TIMESTAMP NOT NULL,
    reporting_year INTEGER NOT NULL,

    -- Generation
    export_format VARCHAR(20) NOT NULL,
    output_url VARCHAR(500),
    output_size INTEGER,

    -- Validation
    completeness DECIMAL(5, 2) NOT NULL,
    validation_results JSONB NOT NULL,
    validation_status VARCHAR(20) DEFAULT 'pending',

    -- Status
    status VARCHAR(20) DEFAULT 'draft',

    -- Generation Metadata
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(255) NOT NULL,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    submitted_at TIMESTAMP,
    submission_id VARCHAR(255),

    -- Versioning
    version INTEGER DEFAULT 1,
    previous_version_id UUID,

    -- Metadata
    metadata JSONB,
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generated_reports_company ON generated_reports(company_id, framework_id, reporting_year);
CREATE INDEX idx_generated_reports_status ON generated_reports(status, generated_at);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    -- Event Info
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,

    -- Change Details
    action VARCHAR(50) NOT NULL,
    changes JSONB,

    -- User Info
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,

    -- Source
    source VARCHAR(100),
    source_reference VARCHAR(255),

    -- Timestamp
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id, entity_type, timestamp);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_id, entity_type);
CREATE INDEX idx_audit_logs_event ON audit_logs(event_type, timestamp);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ============================================================================
-- DATA VALIDATION
-- ============================================================================

CREATE TABLE data_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Target
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,

    -- Validation
    validation_rule VARCHAR(255) NOT NULL,
    validation_status VARCHAR(20) NOT NULL,
    validation_message TEXT,

    -- Severity
    severity VARCHAR(20) NOT NULL,

    -- Resolution
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_validations_entity ON data_validations(entity_type, entity_id);
CREATE INDEX idx_data_validations_status ON data_validations(validation_status, severity);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_data_updated_at BEFORE UPDATE ON activity_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emission_factors_updated_at BEFORE UPDATE ON emission_factors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calculated_emissions_updated_at BEFORE UPDATE ON calculated_emissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_reports_updated_at BEFORE UPDATE ON generated_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Latest emissions by scope and company
CREATE VIEW v_latest_emissions_by_scope AS
SELECT
    ce.company_id,
    ce.scope,
    ce.category,
    SUM(ce.emission_amount) as total_emissions,
    COUNT(*) as emission_count,
    MAX(ce.calculated_at) as last_calculated
FROM calculated_emissions ce
WHERE ce.status = 'approved'
GROUP BY ce.company_id, ce.scope, ce.category;

-- View: Company emissions summary
CREATE VIEW v_company_emissions_summary AS
SELECT
    c.id as company_id,
    c.legal_name,
    c.industry,
    SUM(CASE WHEN ce.scope = 1 THEN ce.emission_amount ELSE 0 END) as scope1_total,
    SUM(CASE WHEN ce.scope = 2 THEN ce.emission_amount ELSE 0 END) as scope2_total,
    SUM(CASE WHEN ce.scope = 3 THEN ce.emission_amount ELSE 0 END) as scope3_total,
    SUM(ce.emission_amount) as grand_total
FROM companies c
LEFT JOIN calculated_emissions ce ON c.id = ce.company_id AND ce.status = 'approved'
GROUP BY c.id, c.legal_name, c.industry;

-- ============================================================================
-- SEED DATA - EMISSION FACTORS
-- ============================================================================
-- (Will be populated from compliance/emissionsCalculator.ts emission factor data)
