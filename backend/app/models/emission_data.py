"""
Database models for emissions data tracking
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import (
    Column, String, Integer, Numeric, DateTime, Date, Text,
    ForeignKey, Boolean, CheckConstraint, Index, TIMESTAMP
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base


class Organization(Base):
    """Organization/Company table"""
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(255), nullable=False)
    industry = Column(String(100))
    country = Column(String(2))  # ISO 3166-1 alpha-2
    employee_count = Column(Integer)
    annual_revenue = Column(Numeric(20, 2))

    # Net zero target
    net_zero_target_year = Column(Integer)
    baseline_year = Column(Integer)

    # Timestamps
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    emission_sources = relationship("EmissionDataSource", back_populates="organization")
    inventories = relationship("EmissionInventory", back_populates="organization")


class EmissionDataSource(Base):
    """
    Raw emission data with complete audit trail
    Stores all input data before calculation
    """
    __tablename__ = "emission_data_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # Who entered the data

    # Classification
    scope = Column(Integer, nullable=False)
    scope_3_category = Column(Integer)  # 1-15 for Scope 3
    category = Column(String(100), nullable=False)  # e.g., "stationary_combustion"
    subcategory = Column(String(100))  # e.g., "natural_gas"

    # Time period
    reporting_period_start = Column(Date, nullable=False)
    reporting_period_end = Column(Date, nullable=False)

    # Activity data (raw input)
    activity_amount = Column(Numeric(20, 4), nullable=False)
    activity_unit = Column(String(50), nullable=False)  # e.g., "kWh", "liters"

    # Source documentation
    data_source = Column(String(100), nullable=False)  # "utility_bill", "fuel_receipt", etc.
    source_reference = Column(String(255))  # Invoice number, etc.
    document_url = Column(Text)
    data_quality_score = Column(Integer)  # 1-5 tier

    # Location (for Scope 2 grid factors)
    location_country = Column(String(2))
    location_region = Column(String(100))

    # Import metadata
    imported_at = Column(TIMESTAMP, default=datetime.utcnow)
    import_method = Column(String(50))  # "manual", "csv", "api"
    notes = Column(Text)

    # Audit trail
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True))
    updated_by = Column(UUID(as_uuid=True))
    version = Column(Integer, default=1)

    # Soft delete
    deleted_at = Column(TIMESTAMP)

    # Constraints
    __table_args__ = (
        CheckConstraint('scope IN (1, 2, 3)', name='valid_scope'),
        CheckConstraint('scope_3_category IS NULL OR scope_3_category BETWEEN 1 AND 15', name='valid_scope_3_category'),
        CheckConstraint('reporting_period_end > reporting_period_start', name='valid_period'),
        CheckConstraint('data_quality_score IS NULL OR data_quality_score BETWEEN 1 AND 5', name='valid_quality_score'),
        Index('idx_emission_sources_org_period', 'organization_id', 'reporting_period_start', 'reporting_period_end'),
        Index('idx_emission_sources_scope', 'scope', 'scope_3_category'),
    )

    # Relationships
    organization = relationship("Organization", back_populates="emission_sources")
    calculations = relationship("Calculation", back_populates="data_source")


class EmissionFactor(Base):
    """
    Comprehensive emission factor database
    Sources: EPA, DEFRA, IEA, custom factors
    """
    __tablename__ = "emission_factors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Classification
    scope = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100))

    # Geographic applicability
    region = Column(String(50), nullable=False)  # "global", "US", "EU", "UK"
    country_code = Column(String(2))  # ISO 3166-1 alpha-2

    # Factor details
    factor_value = Column(Numeric(20, 10), nullable=False)  # e.g., 0.233 kg CO2e/kWh
    factor_unit = Column(String(100), nullable=False)  # e.g., "kg_co2e_per_kwh"
    gas_breakdown = Column(JSONB)  # {"co2": 0.22, "ch4": 0.01, "n2o": 0.003}

    # Source and validity
    source = Column(String(100), nullable=False)  # "EPA", "DEFRA", "IEA", "Custom"
    source_year = Column(Integer, nullable=False)
    publication_date = Column(Date)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date)

    # Quality metadata
    data_quality_tier = Column(Integer)  # 1-5
    methodology = Column(Text)
    uncertainty_percentage = Column(Numeric(5, 2))

    # Additional details
    description = Column(Text)
    notes = Column(Text)
    reference_url = Column(Text)

    # Timestamps
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Custom factor flag
    is_custom = Column(Boolean, default=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))  # NULL for global

    # Constraints
    __table_args__ = (
        CheckConstraint('scope IN (1, 2, 3)', name='factor_valid_scope'),
        CheckConstraint('data_quality_tier IS NULL OR data_quality_tier BETWEEN 1 AND 5', name='factor_valid_tier'),
        Index('idx_factors_category', 'scope', 'category', 'subcategory'),
        Index('idx_factors_region', 'region', 'country_code'),
        Index('idx_factors_validity', 'valid_from', 'valid_to'),
    )

    # Relationships
    calculations = relationship("Calculation", back_populates="emission_factor")


class Calculation(Base):
    """
    Calculated emissions with full traceability
    Links source data to emission factors and stores results
    """
    __tablename__ = "calculations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Links to source data
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("emission_data_sources.id"), nullable=False)
    emission_factor_id = Column(UUID(as_uuid=True), ForeignKey("emission_factors.id"), nullable=False)

    # Calculation inputs (snapshot for audit trail)
    activity_amount = Column(Numeric(20, 4), nullable=False)
    activity_unit = Column(String(50), nullable=False)
    emission_factor = Column(Numeric(20, 10), nullable=False)
    emission_factor_unit = Column(String(100), nullable=False)

    # Calculation results (always in kg CO2e)
    co2e_kg = Column(Numeric(20, 4), nullable=False)
    co2_kg = Column(Numeric(20, 4))
    ch4_kg = Column(Numeric(20, 4))
    n2o_kg = Column(Numeric(20, 4))

    # Uncertainty
    uncertainty_percentage = Column(Numeric(5, 2))
    confidence_interval_lower = Column(Numeric(20, 4))
    confidence_interval_upper = Column(Numeric(20, 4))

    # Calculation metadata
    calculation_method = Column(String(100), nullable=False)  # "direct_measurement", "activity_based", etc.
    calculation_formula = Column(Text)  # For transparency
    calculation_timestamp = Column(TIMESTAMP, default=datetime.utcnow)
    calculation_version = Column(String(50))  # Engine version

    # Status
    status = Column(String(50), default='calculated')  # calculated, verified, audited
    verified_by = Column(UUID(as_uuid=True))
    verified_at = Column(TIMESTAMP)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Constraints
    __table_args__ = (
        Index('idx_calculations_org', 'organization_id'),
        Index('idx_calculations_source', 'data_source_id'),
        Index('idx_calculations_timestamp', 'calculation_timestamp'),
    )

    # Relationships
    data_source = relationship("EmissionDataSource", back_populates="calculations")
    emission_factor = relationship("EmissionFactor", back_populates="calculations")


class EmissionInventory(Base):
    """
    Aggregated emissions by reporting period
    The "final answer" for a period
    """
    __tablename__ = "emission_inventories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Reporting period
    reporting_period_start = Column(Date, nullable=False)
    reporting_period_end = Column(Date, nullable=False)
    fiscal_year = Column(Integer)

    # Scope totals (in tons CO2e)
    scope_1_total = Column(Numeric(20, 4), default=0)
    scope_2_total = Column(Numeric(20, 4), default=0)
    scope_2_location_based = Column(Numeric(20, 4), default=0)
    scope_2_market_based = Column(Numeric(20, 4), default=0)
    scope_3_total = Column(Numeric(20, 4), default=0)

    # Scope 3 category breakdown
    scope_3_breakdown = Column(JSONB)  # {1: 100.5, 2: 50.3, ...}

    # Total emissions (computed)
    total_emissions = Column(Numeric(20, 4))

    # Offsets
    carbon_offsets_purchased = Column(Numeric(20, 4), default=0)
    carbon_credits_from_marketplace = Column(Numeric(20, 4), default=0)

    # Net emissions
    net_emissions = Column(Numeric(20, 4))

    # Metadata
    calculation_count = Column(Integer, default=0)
    data_quality_score = Column(Numeric(3, 2))

    # Status
    status = Column(String(50), default='draft')  # draft, finalized, verified, audited
    finalized_at = Column(TIMESTAMP)
    finalized_by = Column(UUID(as_uuid=True))

    # Verification
    verification_status = Column(String(50))  # pending, verified, rejected
    verified_by_organization = Column(String(255))
    verification_certificate_url = Column(Text)
    verified_at = Column(TIMESTAMP)

    # Timestamps
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Constraints
    __table_args__ = (
        CheckConstraint('reporting_period_end > reporting_period_start', name='inventory_valid_period'),
        Index('idx_inventories_org_period', 'organization_id', 'reporting_period_start'),
    )

    # Relationships
    organization = relationship("Organization", back_populates="inventories")
    generated_reports = relationship("GeneratedReport", back_populates="inventory")


class GeneratedReport(Base):
    """
    Audit trail for all generated reports
    """
    __tablename__ = "generated_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    inventory_id = Column(UUID(as_uuid=True), ForeignKey("emission_inventories.id"))

    # Report details
    report_type = Column(String(50), nullable=False)  # "CSRD", "CDP", "GHG_PROTOCOL"
    report_format = Column(String(20), nullable=False)  # "PDF", "EXCEL", "XBRL"
    reporting_period_start = Column(Date, nullable=False)
    reporting_period_end = Column(Date, nullable=False)

    # File storage
    file_url = Column(Text, nullable=False)
    file_size_bytes = Column(Integer)
    file_hash = Column(String(64))  # SHA256

    # Report metadata
    report_title = Column(String(255))
    report_version = Column(String(50))
    template_version = Column(String(50))

    # Generation details
    generated_at = Column(TIMESTAMP, default=datetime.utcnow)
    generated_by = Column(UUID(as_uuid=True), nullable=False)
    generation_duration_ms = Column(Integer)

    # Submission tracking
    submitted_to = Column(String(255))  # Regulatory body
    submitted_at = Column(TIMESTAMP)
    submission_reference = Column(String(255))
    submission_status = Column(String(50))  # pending, accepted, rejected

    # Access log
    download_count = Column(Integer, default=0)
    last_downloaded_at = Column(TIMESTAMP)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Constraints
    __table_args__ = (
        Index('idx_reports_org', 'organization_id'),
        Index('idx_reports_type', 'report_type'),
        Index('idx_reports_inventory', 'inventory_id'),
    )

    # Relationships
    inventory = relationship("EmissionInventory", back_populates="generated_reports")


class AuditLog(Base):
    """
    Complete audit trail of all system actions
    """
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Who
    user_id = Column(UUID(as_uuid=True))
    user_email = Column(String(255))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))

    # What
    action = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE, CALCULATE, etc.
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(UUID(as_uuid=True))

    # Details
    changes = Column(JSONB)  # Before/after values
    additional_metadata = Column(JSONB)  # Additional context

    # When & Where
    timestamp = Column(TIMESTAMP, default=datetime.utcnow, index=True)
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)

    # Result
    success = Column(Boolean, default=True)
    error_message = Column(Text)

    # Constraints
    __table_args__ = (
        Index('idx_audit_org_time', 'organization_id', 'timestamp'),
        Index('idx_audit_user', 'user_id', 'timestamp'),
        Index('idx_audit_resource', 'resource_type', 'resource_id'),
    )
